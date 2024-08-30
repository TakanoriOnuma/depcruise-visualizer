/**
 * 要素内に含まれているtitleタグのテキストを取得する
 * @param el - 要素
 */
export const getTitleInElement = (el: Element) => {
  const elTitle = el.querySelector("title");
  return elTitle?.textContent ?? "";
};
