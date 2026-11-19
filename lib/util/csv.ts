/** Quotes a CSV cell and neutralises leading characters spreadsheets treat as formulas. */
export function csvCell(value: string | number) {
  const text = String(value)
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text
  return `"${safe.replace(/"/g, '""')}"`
}
