/**
 * Text aus einem PDF ziehen (Tests, Einsicht in die Datei selbst).
 * @react-pdf/renderer schreibt oft TJ-Arrays mit Hex-Strings.
 */

import { inflateRawSync, inflateSync } from "node:zlib";

function decodePdfLiteral(s: string): string {
  return s
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\([0-7]{1,3})/g, (_, oct: string) =>
      String.fromCharCode(parseInt(oct, 8)),
    )
    .replace(/\\([()\\])/g, "$1");
}

function decodePdfHex(hex: string): string {
  const h = hex.replace(/\s+/g, "");
  const padded = h.length % 2 === 1 ? `${h}0` : h;
  const bytes = Buffer.alloc(padded.length / 2);
  for (let i = 0; i < padded.length; i += 2) {
    bytes[i / 2] = Number.parseInt(padded.slice(i, i + 2), 16);
  }
  return bytes.toString("latin1");
}

function inflatePdfStream(bytes: Buffer): string | null {
  for (const fn of [inflateSync, inflateRawSync]) {
    try {
      return fn(bytes).toString("latin1");
    } catch {
      /* nächster Decoder */
    }
  }
  return null;
}

function textFromOperators(hay: string): string {
  const parts: string[] = [];
  const tj = /\[([\s\S]*?)\]\s*T[Jj]/g;
  let m: RegExpExecArray | null;
  while ((m = tj.exec(hay))) {
    const inner = m[1];
    const token =
      /\((?:\\.|[^\\)])*\)|<([0-9A-Fa-f\s]+)>/g;
    let t: RegExpExecArray | null;
    while ((t = token.exec(inner))) {
      if (t[0].startsWith("(")) {
        parts.push(decodePdfLiteral(t[0].slice(1, -1)));
      } else if (t[1]) {
        parts.push(decodePdfHex(t[1]));
      }
    }
  }
  const lit = /\(((?:\\.|[^\\)])*)\)/g;
  let t: RegExpExecArray | null;
  while ((t = lit.exec(hay))) {
    parts.push(decodePdfLiteral(t[1]));
  }
  return parts.join("");
}

export function extractPdfText(buf: Buffer): string {
  const raw = buf.toString("latin1");
  const chunks: string[] = [raw];
  const streamRe = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let m: RegExpExecArray | null;
  while ((m = streamRe.exec(raw))) {
    const bytes = Buffer.from(m[1], "latin1");
    const decoded = inflatePdfStream(bytes);
    if (decoded) chunks.push(decoded);
  }
  const hay = chunks.join("\n");
  return textFromOperators(hay);
}
