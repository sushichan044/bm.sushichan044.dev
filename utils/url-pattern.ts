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

export class URLPatternMatcher<
  Inputs extends readonly unknown[] = readonly unknown[],
  Output = unknown,
> {
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
