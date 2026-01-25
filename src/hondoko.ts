import { regex } from "arkregex";

import { isISBN } from "../utils/isbn";
import { URLPatternMatcher } from "../utils/url-pattern";

// ISBN・EAN: 9784798640310
const booklogISBNRegex = regex("ISBN・EAN:\s*([0-9]{10}(?:[0-9]{3})?)");

function extractISBN(url: URL, html: string): string | undefined {
  const isbn = new URLPatternMatcher(url, html)
    .expect<string | undefined>()
    .case(
      {
        hostname: "www.maruzenjunkudo.co.jp",
        pathname: "/products/:productId",
        protocol: "http{s}?",
      },
      (match) => {
        const productId = match.pathname.groups["productId"];
        if (isISBN(productId)) {
          return productId;
        }
        return undefined;
      },
    )
    .case(
      {
        hostname: "www.maruzenjunkudo.co.jp",
        pathname: "/pages/shoplist",
        protocol: "http{s}?",
      },
      (_, url) => {
        const product = url.searchParams.get("product");
        if (isISBN(product)) {
          return product;
        }
        return undefined;
      },
    )
    .case(
      {
        hostname: "booklog.jp",
        pathname: "/item/1/:pageId",
        protocol: "http{s}?",
      },
      (_, __, html) => {
        const htmlMatch = booklogISBNRegex.exec(html);
        if (htmlMatch) {
          return htmlMatch[1];
        }
        return undefined;
      },
    )
    .exec();

  return isbn;
}

function main() {
  if (!("URLPattern" in globalThis)) {
    window.alert("This bookmarklet requires browser support for the URLPattern API.");
    return;
  }

  const currentUrl = new URL(document.URL);
  const html = document.documentElement.innerHTML;
  const isbn = extractISBN(currentUrl, html);

  if (isbn === undefined) {
    window.alert("Could not extract ISBN.");
    return;
  }

  const hondokoUrl = new URL("https://hondoko.nakashima723.info/");
  hondokoUrl.searchParams.set("isbn", isbn);
  window.open(hondokoUrl.toString(), "_blank");
}

main();
document.currentScript?.remove();
