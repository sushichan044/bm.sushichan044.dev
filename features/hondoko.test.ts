import { describe, expect, it } from "bun:test";

import { extractISBNFromHTML } from "./hondoko";

describe("extractISBNFromHTML", () => {
  it("should extract ISBN", () => {
    const html = `
<div class="item-caption-area">
    <a href="/buildhtml/item/1/4065345707" class="copy-to-site">サイトに貼り付ける</a>
    <div class="info-area">
      <p class="affi-info">
        本ページはアフィリエイトプログラムによる収益を得ています
      </p>
      <p class="affi-info">
                        Amazon.co.jp ・マンガ (192ページ)                                / ISBN・EAN: 9784065345702
                </p>
            </div>
  </div>
`;

    expect(extractISBNFromHTML(html)).toBe("9784065345702");
  });
});
