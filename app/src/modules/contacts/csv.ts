/**
 * Zettelruhe-Kontakte-CSV → dünner Kund:innenstamm.
 * Nur Name und Kontaktnummer. Kein Live-Abgleich.
 */

export type KundenCsvZeile = {
  name: string;
  zettelruhe_kontaktnummer: string;
};

export type KundenCsvParseResult = {
  items: KundenCsvZeile[];
  errors: string[];
  skipped: number;
};

export type KundenImportPlan = {
  anlegen: KundenCsvZeile[];
  aktualisieren: Array<KundenCsvZeile & { id: string }>;
  uebersprungen: number;
};

type CsvSpalte = "name" | "kontaktnummer" | "ist_kunde" | "ist_lieferant";

const HEADER_ALIASES: Record<string, CsvSpalte> = {
  name: "name",
  firma: "name",
  "name/firma": "name",
  bezeichnung: "name",
  kontaktnummer: "kontaktnummer",
  "kontakt-nr": "kontaktnummer",
  "kontakt-nr.": "kontaktnummer",
  kundennummer: "kontaktnummer",
  "kunden-nr": "kontaktnummer",
  "kunden-nr.": "kontaktnummer",
  kunden_nr: "kontaktnummer",
  knr: "kontaktnummer",
  ist_kunde: "ist_kunde",
  kunde: "ist_kunde",
  "kund:in": "ist_kunde",
  kundin: "ist_kunde",
  ist_lieferant: "ist_lieferant",
  lieferant: "ist_lieferant",
  "lieferant:in": "ist_lieferant",
};

function detectDelimiter(headerLine: string): "," | ";" {
  const semi = (headerLine.match(/;/g) ?? []).length;
  const comma = (headerLine.match(/,/g) ?? []).length;
  return semi >= comma ? ";" : ",";
}

function parseCsvRows(text: string): string[][] {
  const normalized = text
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
  if (!normalized.trim()) return [];

  const firstLine = normalized.split("\n")[0] ?? "";
  const delim = detectDelimiter(firstLine);

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];
    const next = normalized[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === delim) {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

function parseBool(raw: string): boolean {
  const v = raw.trim().toLowerCase();
  if (!v) return false;
  return ["1", "true", "ja", "yes", "x", "y"].includes(v);
}

/**
 * Parst Zettelruhes Kontakte-CSV. Nur Kund:innen mit Kontaktnummer.
 */
export function parseKundenCsv(text: string): KundenCsvParseResult {
  const rows = parseCsvRows(text);
  if (rows.length === 0) {
    return { items: [], errors: ["CSV ist leer."], skipped: 0 };
  }

  const headerCells = rows[0].map((h) => h.trim().toLowerCase());
  const colIndex = new Map<CsvSpalte, number>();
  for (let i = 0; i < headerCells.length; i++) {
    const key = HEADER_ALIASES[headerCells[i]];
    if (key && !colIndex.has(key)) {
      colIndex.set(key, i);
    }
  }

  if (!colIndex.has("name")) {
    return {
      items: [],
      errors: [
        'Pflichtspalte "name" fehlt im Header (oder Alias "Firma").',
      ],
      skipped: 0,
    };
  }
  if (!colIndex.has("kontaktnummer")) {
    return {
      items: [],
      errors: [
        'Pflichtspalte "kontaktnummer" fehlt im Header (oder Alias "Kundennummer").',
      ],
      skipped: 0,
    };
  }

  const byNummer = new Map<string, KundenCsvZeile>();
  let skipped = 0;

  for (let r = 1; r < rows.length; r++) {
    const line = rows[r];
    const cell = (key: CsvSpalte): string => {
      const idx = colIndex.get(key);
      if (idx === undefined) return "";
      return (line[idx] ?? "").trim();
    };

    const name = cell("name").replace(/\s+/g, " ");
    const nummer = cell("kontaktnummer");
    if (!name || !nummer) {
      skipped += 1;
      continue;
    }

    let istKunde = parseBool(cell("ist_kunde"));
    const istLieferant = parseBool(cell("ist_lieferant"));
    if (!istKunde && !istLieferant) {
      istKunde = true;
    }
    if (!istKunde) {
      skipped += 1;
      continue;
    }

    byNummer.set(nummer, { name, zettelruhe_kontaktnummer: nummer });
  }

  const items = [...byNummer.values()];
  const errors: string[] = [];
  if (items.length === 0 && skipped === 0) {
    errors.push("Keine gültigen Datenzeilen gefunden.");
  }

  return { items, errors, skipped };
}

export function planeKundenImport(
  parsed: KundenCsvParseResult,
  bestehend: Array<{
    id: string;
    name: string;
    zettelruhe_kontaktnummer: string | null;
  }>,
): KundenImportPlan {
  const nachNummer = new Map<
    string,
    { id: string; name: string; zettelruhe_kontaktnummer: string }
  >();
  for (const k of bestehend) {
    const n = (k.zettelruhe_kontaktnummer ?? "").trim();
    if (n) {
      nachNummer.set(n, {
        id: k.id,
        name: k.name,
        zettelruhe_kontaktnummer: n,
      });
    }
  }

  const anlegen: KundenCsvZeile[] = [];
  const aktualisieren: Array<KundenCsvZeile & { id: string }> = [];

  for (const zeile of parsed.items) {
    const alt = nachNummer.get(zeile.zettelruhe_kontaktnummer);
    if (!alt) {
      anlegen.push(zeile);
      continue;
    }
    if (alt.name !== zeile.name) {
      aktualisieren.push({ ...zeile, id: alt.id });
    }
  }

  return {
    anlegen,
    aktualisieren,
    uebersprungen: parsed.skipped,
  };
}

export function beschreibeKundenImport(r: {
  angelegt: number;
  aktualisiert: number;
  uebersprungen: number;
}): string {
  return `${r.angelegt} angelegt, ${r.aktualisiert} aktualisiert, ${r.uebersprungen} übersprungen.`;
}
