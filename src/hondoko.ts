/**
 * NOTE: do not declare any top-level variables
 */

type URLPatternParam = ConstructorParameters<typeof URLPattern>[0];

class URLPatternMatcher<Output = unknown, Extras extends readonly unknown[] = readonly unknown[]> {
  #extras: NoInfer<Extras>;
  #output: Output | undefined;
  #url: URL;

  constructor(url: string | URL, ...extras: Extras) {
    this.#url = typeof url === "string" ? new URL(url) : url;
    this.#extras = extras;
  }

  exec(): Output | undefined {
    return this.#output;
  }

  with(
    param: URLPatternParam,
    handler: (match: URLPatternResult, url: URL, ...extras: Extras) => Output,
  ): URLPatternMatcher<Output, Extras> {
    const pattern = new URLPattern(param);
    const match = pattern.exec(this.#url);
    if (match !== null) {
      this.#output = handler(match, this.#url, ...this.#extras);
    }
    return this;
  }
}

function isISBN(value: unknown): value is string {
  return typeof value === "string" && /^[0-9]{10}(?:[0-9]{3})?$/.test(value);
}

function extractISBN(url: URL, html: string): string | undefined {
  const isbn = new URLPatternMatcher<string | undefined, [string]>(url, html)
    .with(
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
    .with(
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
    .with(
      {
        hostname: "booklog.jp",
        pathname: "/item/1/:pageId",
        protocol: "http{s}?",
      },
      (_, __, html) => {
        // ISBN・EAN: 9784798640310
        const htmlMatch = /ISBN・EAN:\s*([0-9]{10}(?:[0-9]{3})?)/.exec(html);
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
