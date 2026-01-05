/**
 * NOTE: do not declare any top-level variables
 */

function createURLPatternMatch<Keys extends string>(patterns: Record<Keys, URLPattern>) {
  return <Args extends unknown[], Result>(handlers: {
    [K in NoInfer<Keys>]: (match: URLPatternResult, url: URL, ...args: Args) => Result;
  }) => {
    return (url: string | URL, ...args: Args): Result | undefined => {
      const targetUrl = typeof url === "string" ? new URL(url) : url;

      for (const key of Object.keys(patterns) as Keys[]) {
        const pattern = patterns[key];
        const match = pattern.exec(targetUrl);
        if (match !== null) {
          return handlers[key](match, targetUrl, ...args);
        }
      }
      return undefined;
    };
  };
}

function isISBN(value: unknown): value is string {
  return typeof value === "string" && /^[0-9]{10}(?:[0-9]{3})?$/.test(value);
}

function extractISBN(url: URL, html: string): string | undefined {
  const patterns = createURLPatternMatch({
    booklog: new URLPattern({
      hostname: "booklog.jp",
      pathname: "/item/1/:pageId",
      protocol: "http{s}?",
    }),
    // https://www.maruzenjunkudo.co.jp/products/9784798638614
    junkudoDetails: new URLPattern({
      hostname: "www.maruzenjunkudo.co.jp",
      pathname: "/products/:productId",
      protocol: "http{s}?",
    }),
    // https://www.maruzenjunkudo.co.jp/pages/shoplist?product=9784798638614
    junkudoSearch: new URLPattern({
      hostname: "www.maruzenjunkudo.co.jp",
      pathname: "/pages/shoplist",
      protocol: "http{s}?",
    }),
  });

  const getISBN = patterns<[string], string | undefined>({
    booklog: (_, __, html) => {
      // ISBN・EAN: 9784798640310
      const htmlMatch = /ISBN・EAN:\s*([0-9]{10}(?:[0-9]{3})?)/.exec(html);
      if (htmlMatch) {
        return htmlMatch[1];
      }
      return undefined;
    },
    junkudoDetails: (match) => {
      const productId = match.pathname.groups["productId"];
      if (isISBN(productId)) {
        return productId;
      }
      return undefined;
    },
    junkudoSearch: (_, url) => {
      const product = url.searchParams.get("product");
      if (isISBN(product)) {
        return product;
      }
      return undefined;
    },
  });

  return getISBN(url, html);
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
