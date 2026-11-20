import yaml from 'js-yaml';

export type Conversion = 'json-csv' | 'csv-json' | 'json-yaml' | 'yaml-json';

export const SAMPLE_JSON = `{
  "project": "JSON Toolkit",
  "version": 1,
  "private": true,
  "features": ["format", "validate", "convert"],
  "owner": {
    "name": "Ibrahim",
    "role": "Developer"
  }
}`;

export function parseJson(source: string): unknown {
  return JSON.parse(source) as unknown;
}

export function formatJson(source: string): string {
  // Parse first so invalid input never produces a misleading result.
  return JSON.stringify(parseJson(source), null, 2);
}

export function minifyJson(source: string): string {
  return JSON.stringify(parseJson(source));
}

export function sortJsonKeys(value: unknown): unknown {
  // Sort nested objects too, not only the root object.
  if (Array.isArray(value)) return value.map(sortJsonKeys);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, child]) => [key, sortJsonKeys(child)]),
    );
  }
  return value;
}

function csvCell(value: unknown): string {
  const text = value === null || value === undefined
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value)
      : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function jsonToCsv(source: string): string {
  const value = parseJson(source);
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error('JSON to CSV expects a non-empty array of objects.');
  }
  if (!value.every((row) => row !== null && typeof row === 'object' && !Array.isArray(row))) {
    throw new Error('Every item in the JSON array must be an object.');
  }

  const records = value as Array<Record<string, unknown>>;
  const headers = [...new Set(records.flatMap((row) => Object.keys(row)))];
  if (headers.length === 0) throw new Error('Each JSON object must contain at least one field.');
  return [
    headers.map(csvCell).join(','),
    ...records.map((row) => headers.map((header) => csvCell(row[header])).join(',')),
  ].join('\n');
}

function parseCsv(source: string): string[][] {
  // Track quoted cells so commas and newlines inside quotes stay intact.
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quoted) {
      if (char === '"' && source[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"' && cell.length === 0) {
      quoted = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && source[index + 1] === '\n') index += 1;
      row.push(cell);
      if (row.some((item) => item.length > 0) || cell.length > 0) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  if (quoted) throw new Error('CSV contains an unclosed quoted field.');
  row.push(cell);
  if (row.some((item) => item.length > 0)) rows.push(row);
  return rows;
}

export function csvToJson(source: string): string {
  const rows = parseCsv(source.trim());
  if (rows.length < 2) throw new Error('CSV needs a header row and at least one data row.');

  const headers = rows[0].map((header) => header.trim());
  if (headers.some((header) => !header)) throw new Error('CSV headers cannot be empty.');
  if (new Set(headers).size !== headers.length) throw new Error('CSV headers must be unique.');

  const objects = rows.slice(1).map((row, rowIndex) => {
    if (row.length !== headers.length) {
      throw new Error(`Row ${rowIndex + 2} has ${row.length} columns; expected ${headers.length}.`);
    }
    return Object.fromEntries(headers.map((header, index) => [header, row[index]]));
  });

  return JSON.stringify(objects, null, 2);
}

export function convertData(source: string, conversion: Conversion): string {
  switch (conversion) {
    case 'json-csv':
      return jsonToCsv(source);
    case 'csv-json':
      return csvToJson(source);
    case 'json-yaml':
      return yaml.dump(parseJson(source), { noRefs: true, lineWidth: 100 });
    case 'yaml-json':
      return JSON.stringify(yaml.load(source), null, 2);
  }
}

export function getJsonErrorPosition(message: string, source: string): { line: number; column: number } | null {
  const match = message.match(/position\s+(\d+)/i);
  if (!match) return null;
  const beforeError = source.slice(0, Number(match[1]));
  const lines = beforeError.split(/\r\n|\r|\n/);
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}

export function getTextStats(source: string) {
  return {
    characters: source.length,
    lines: source.length ? source.split(/\r\n|\r|\n/).length : 0,
    bytes: new Blob([source]).size,
  };
}
