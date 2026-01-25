export function isISBN(value: unknown): value is string {
  return typeof value === "string" && /^[0-9]{10}(?:[0-9]{3})?$/.test(value);
}
