import type { FC } from "hono/jsx";

import { Hono } from "hono";
import { css, Style } from "hono/css";

type Bookmarklet = {
  description: string;
  pathname: `/${string}`;
  /**
   * @see {@link https://github.com/web-platform-dx/web-features}
   */
  requiredWebFeature?: string;
  title: string;
};

function getBookmarkletScript(pathname: string): string {
  const scriptUrl = new URL(pathname, "https://bm.sushichan044.dev").toString();

  return `javascript:(function(){var s=document.createElement('script');s.src='${scriptUrl}';document.body.appendChild(s);})();`;
}

const bookmarklets = [
  {
    description: [
      "対応しているページで使用すると、ISBNを抽出してHondokoのページを開きます。",
      "URLPattern API をサポートしているブラウザが必要です。",
    ].join("\n"),
    pathname: "/hondoko.mjs",
    requiredWebFeature: "urlpattern",
    title: "Hondoko ISBN Extractor",
  },
] as const satisfies Bookmarklet[];

const globalStyles = css`
  :root {
    --bg-primary: #ffffff;
    --bg-secondary: #f8f8f8;
    --text-primary: #1a1a1a;
    --text-secondary: #4a4a4a;
    --link-color: #0066cc;
    --link-hover: #0052a3;
    --shadow: rgba(0, 0, 0, 0.08);
    --shadow-hover: rgba(0, 0, 0, 0.12);
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --bg-primary: #1a1a1a;
      --bg-secondary: #2a2a2a;
      --text-primary: #f0f0f0;
      --text-secondary: #b0b0b0;
      --link-color: #66b3ff;
      --link-hover: #99ccff;
      --shadow: rgba(255, 255, 255, 0.1);
      --shadow-hover: rgba(255, 255, 255, 0.15);
    }
  }

  * {
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
  }

  body {
    font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    margin: 0;
    padding: 0;
    line-height: 1.6;
    min-height: 100vh;
  }

  footer {
    position: sticky;
    top: 100%;
  }

  a {
    display: inline-block;
    font-size: 1rem;
    color: var(--link-color);
    text-decoration: underline;
    transition: color 0.2s ease-in-out;

    &:hover {
      color: var(--link-hover);
    }

    &:focus {
      outline: 2px solid var(--link-color);
      outline-offset: 2px;
    }
  }

  baseline-status {
    margin-block: 1rem;
  }
`;

const containerStyle = css`
  max-width: 1200px;
  margin-inline: auto;
  padding: 1rem;
  width: 100%;
  height: 100%;

  @media (min-width: 1025px) {
    padding: 2rem;
  }
`;

const headerStyle = css`
  margin-bottom: 2rem;
`;

const titleStyle = css`
  font-size: 2rem;
  line-height: 1.2;
  margin: 0;
  color: var(--text-primary);

  @media (min-width: 641px) {
    font-size: 2.5rem;
  }
`;

const app = new Hono<{ Bindings: Env }>();

app.get("/", async (c) => {
  return c.html(
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <meta content="width=device-width, initial-scale=1.0" name="viewport" />
        <meta content="noindex,nofollow" name="robots" />
        <meta content="sushichan044's Bookmarklets Collection" name="description" />
        <meta content="summary" name="twitter:card" />
        <meta content="sushichan044's Bookmarklets" name="og:title" />
        <meta
          content="A collection of bookmarklets created by sushichan044."
          name="og:description"
        />
        <meta content="website" name="og:type" />
        <meta content="https://bm.sushichan044.dev" name="og:url" />
        <title>sushichan044's Bookmarklets</title>
        {/* Baseline Status Widget https://github.com/web-platform-dx/baseline-status */}
        <script
          src="https://cdn.jsdelivr.net/npm/baseline-status@1/baseline-status.min.js"
          type="module"
        ></script>
        <Style />
      </head>

      <body class={globalStyles}>
        <div class={containerStyle}>
          <header class={headerStyle}>
            <h1 class={titleStyle}>sushichan044's Bookmarklets</h1>
          </header>

          <main>
            <BookmarkletList items={bookmarklets} />
          </main>

          <footer>
            <p>
              © 2026{" "}
              <a href="https://github.com/sushichan044" rel="noopener noreferrer" target="_blank">
                sushichan044
              </a>
            </p>
          </footer>
        </div>
      </body>
    </html>,
  );
});

const listStyle = css`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (min-width: 1025px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

type BookmarkletListProps = {
  items: readonly Bookmarklet[];
};

const BookmarkletList: FC<BookmarkletListProps> = async ({ items }) => {
  return (
    <ul class={listStyle}>
      {items.map(async (bm) => (
        <BookmarkletCard bookmarklet={bm} key={bm.pathname} />
      ))}
    </ul>
  );
};

const cardStyle = css`
  background-color: var(--bg-secondary);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px var(--shadow);

  &:hover {
    box-shadow: 0 4px 12px var(--shadow-hover);
  }
`;

const cardTitleStyle = css`
  font-size: 1.25rem;
  line-height: 1.2;
  margin: 0 0 0.75rem 0;
  color: var(--text-primary);

  @media (min-width: 641px) {
    font-size: 1.5rem;
  }
`;

const cardDescriptionStyle = css`
  font-size: 1rem;
  line-height: 1.6;
  margin: 0 0 1rem 0;
  color: var(--text-secondary);
`;

type BookmarkletCardProps = {
  bookmarklet: Bookmarklet;
};

const BookmarkletCard: FC<BookmarkletCardProps> = async ({ bookmarklet }) => {
  const webFeature = bookmarklet.requiredWebFeature;

  return (
    <li class={cardStyle}>
      <h2 class={cardTitleStyle}>{bookmarklet.title}</h2>
      <p class={cardDescriptionStyle}>{bookmarklet.description}</p>
      <a href={getBookmarkletScript(bookmarklet.pathname)}>
        Drag this link to your bookmarks: {bookmarklet.title}
      </a>
      {webFeature !== undefined ? (
        <baseline-status
          feature-id={webFeature}
          style="margin-bottom: 1rem; display: block;"
        ></baseline-status>
      ) : null}
    </li>
  );
};

export default app;
