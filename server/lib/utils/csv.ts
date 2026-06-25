/**
 * CSV formatting utilities
 */

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsvRow(values: unknown[]): string {
  return values.map(escapeCsvValue).join(',');
}

export function toCsv(headers: string[], rows: unknown[][]): string {
  const lines = [toCsvRow(headers), ...rows.map((row) => toCsvRow(row))];
  return lines.join('\r\n');
}
