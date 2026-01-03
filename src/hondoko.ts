type ISBNExtractor = (url: URL, html: string) => string | undefined;

const booklogExtractor: ISBNExtractor = (_, html) => {
  // ISBN・EAN: 9784798640310
  const match = /ISBN・EAN:\s*([0-9]{13})/.exec(html);
  if (match) {
    return match[1];
  }
  return undefined;
};

const booklogPattern = new URLPattern({
  hostname: "booklog.jp",
  pathname: "/item/1/:pageId",
  protocol: "http{s}?",
});

function main() {
  const currentUrl = new URL(document.URL);
  const html = document.documentElement.innerHTML;

  let isbn: string | undefined;
  switch (true) {
    case booklogPattern.test(currentUrl):
      isbn = booklogExtractor(currentUrl, html);
      break;
  }

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
