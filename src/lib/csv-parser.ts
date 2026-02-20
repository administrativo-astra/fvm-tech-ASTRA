export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  // Detect separator (comma, semicolon, or tab)
  const firstLine = lines[0];
  let separator = ",";
  if (firstLine.includes(";")) separator = ";";
  else if (firstLine.includes("\t")) separator = "\t";

  const headers = lines[0].split(separator).map((h) => h.trim().replace(/^["']|["']$/g, ""));

  return lines.slice(1).map((line) => {
    const values = parseLine(line, separator);
    const row: Record<string, string> = {};
    headers.forEach((header, i) => {
      row[header] = (values[i] || "").trim().replace(/^["']|["']$/g, "");
    });
    return row;
  }).filter((row) => Object.values(row).some((v) => v !== ""));
}

function parseLine(line: string, separator: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === separator && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}
