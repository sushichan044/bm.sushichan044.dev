import { regex } from "arkregex";

import type { ISBN } from "../utils/isbn";
export function extractISBNFromHTML(html: string): ISBN | null {
  const booklogISBNRegex = regex("ISBN・EAN:\\s*([0-9]{10}(?:[0-9]{3})?)");

  const match = booklogISBNRegex.exec(html);

  return match ? match[1] : null;
}
