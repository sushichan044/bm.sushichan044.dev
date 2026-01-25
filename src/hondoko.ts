import { extractISBNFromHTML } from "../features/hondoko";
import { isISBN } from "../utils/isbn";
import { URLPatternMatcher } from "../utils/url-pattern";

function extractISBN(url: URL, html: string): string | null {
  const isbn = new URLPatternMatcher(url, html)
    .expect<string | null>()
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
        return null;
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
        return null;
      },
    )
    .case(
      {
        hostname: "booklog.jp",
        pathname: "/item/1/:pageId",
        protocol: "http{s}?",
      },
      (_, __, html) => {
        return extractISBNFromHTML(html);
      },
    )
    .exec();

  return isbn ?? null;
}

function main() {
  if (!("URLPattern" in globalThis)) {
    window.alert("This bookmarklet requires browser support for the URLPattern API.");
    return;
  }

  const currentUrl = new URL(document.URL);
  const html = document.documentElement.innerHTML;
  const isbn = extractISBN(currentUrl, html);

  if (isbn == null) {
    window.alert("Could not extract ISBN.");
    return;
  }

  const hondokoUrl = new URL("https://hondoko.nakashima723.info/");
  hondokoUrl.searchParams.set("isbn", isbn);
  window.open(hondokoUrl.toString(), "_blank");
}

main();
document.currentScript?.remove();
