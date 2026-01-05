/**
 * NOTE: do not declare any top-level variables
 */

type URLPatternParam = ConstructorParameters<typeof URLPattern>[0];

type MatchState<Output> =
  | {
      matched: false;
      output: undefined;
    }
  | {
      matched: true;
      output: Output;
    };

class URLPatternMatcher<Inputs extends readonly unknown[] = readonly unknown[], Output = unknown> {
  #extras: NoInfer<Inputs>;
  #state: MatchState<Output>;
  #url: URL;

  constructor(url: string | URL, ...extras: Inputs) {
    this.#url = typeof url === "string" ? new URL(url) : url;
    this.#extras = extras;
    this.#state = { matched: false, output: undefined };
  }

  case(
    param: URLPatternParam,
    handler: (match: URLPatternResult, url: URL, ...extras: Inputs) => Output,
  ): URLPatternMatcher<Inputs, Output> {
    if (this.#state.matched) {
      return this;
    }

    const pattern = new URLPattern(param);
    const match = pattern.exec(this.#url);
    if (match !== null) {
      this.#state = { matched: true, output: handler(match, this.#url, ...this.#extras) };
    }
    return this;
  }

  exec(): Output | undefined {
    return this.#state.matched ? this.#state.output : undefined;
  }

  expect<T>(): URLPatternMatcher<Inputs, T> {
    return this as unknown as URLPatternMatcher<Inputs, T>;
  }
}

function isISBN(value: unknown): value is string {
  return typeof value === "string" && /^[0-9]{10}(?:[0-9]{3})?$/.test(value);
}

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
