import { describe, expect, it } from "bun:test";

import { extractISBNFromHTML } from "./hondoko";

describe("extractISBNFromHTML", () => {
  it("should extract ISBN from PC layout", () => {
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

  it("should extract ISBN from mobile layout", () => {
    const html = `
<div class="isbn">
  ISBN・EAN: <span>9784065419458</span>
</div>
    `;
    expect(extractISBNFromHTML(html)).toBe("9784065419458");
  });
});
