export function isISBN(value: unknown): value is ISBN {
  return typeof value === "string" && /^[0-9]{10}(?:[0-9]{3})?$/.test(value);
}

export type ISBN = `${number}`;
