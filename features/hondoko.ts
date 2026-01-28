import { regex } from "arkregex";

import type { ISBN } from "../utils/isbn";

import { isISBN } from "../utils/isbn";

export function extractISBNFromHTML(html: string): ISBN | null {
  const booklogISBNRegex = regex("ISBN・EAN:\\s*([0-9]{10}(?:[0-9]{3})?)");

  const match = booklogISBNRegex.exec(html);

  if (match) {
    return match[1];
  }

  // Mobile layout requires DOM querying
  const template = document.createElement("template");
  template.innerHTML = html;

  // query .isbn > span
  const span = template.content.querySelector(".isbn > span");
  if (span) {
    const text = span.textContent.trim();
    if (isISBN(text)) {
      return text;
    }
  }

  return null;
}
