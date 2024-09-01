import { getTitleInElement } from "./getTitleInElement";

/**
 * グラフ上にあるNodeとEdgeのリストから、タイトルをキーにしたMapを作成する
 * @param nodes - Nodeリスト
 * @param edges - Edgeリスト
 */
export const createTitle2ElementsMap = (
  nodes: Element[],
  edges: Element[]
): Record<string, Element[]> => {
  const title2ElementsMap: Record<string, Element[]> = {};

  const nodeMap: Record<string, Element> = Object.assign(
    {},
    ...nodes.map((node) => {
      const title = getTitleInElement(node);
      title2ElementsMap[title] = [node];
      return {
        [title]: node,
      };
    })
  );

  edges.forEach((edge) => {
    const title = getTitleInElement(edge);
    const [from, to] = title.split(/\s*->\s*/);

    if (from == null || to == null) {
      return;
    }

    // edgeのタイトルに対して、from, toのNodeを登録する
    const fromNode = nodeMap[from];
    const toNode = nodeMap[to];
    if (fromNode != null && toNode != null) {
      title2ElementsMap[title] = [edge, fromNode, toNode];
    }

    // from, toに対して、Edgeを登録する
    if (title2ElementsMap[from] == null) {
      title2ElementsMap[from] = [];
    }
    title2ElementsMap[from].push(edge);
    if (title2ElementsMap[to] == null) {
      title2ElementsMap[to] = [];
    }
    title2ElementsMap[to].push(edge);
  });

  return title2ElementsMap;
};
