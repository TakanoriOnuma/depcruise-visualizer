import type { IModule } from "dependency-cruiser";
import { DOT_THEME } from "./dotTheme";

/**
 * オブジェクトで管理している属性を文字列に変換する
 * @param attrObj - 属性を持つオブジェクト
 */
const attributizeObject = (attrObj: Record<string, string | number>) => {
  return Object.keys(attrObj)
    .map((key) => `${key}="${attrObj[key]}"`)
    .join(" ");
};

/**
 * DOT言語のグラフの属性を文字列に変換する
 */
const getGeneralAttributesStr = () => {
  return [
    `  ${attributizeObject(DOT_THEME.graph)}`,
    `  node [${attributizeObject(DOT_THEME.node)}]`,
    `  edge [${attributizeObject(DOT_THEME.edge)}]`,
  ].join("\n");
};

/**
 * JSONデータからGraphvizのDOT言語の文字列を生成する
 * @param modules - dependency-cruiserを実行して得られるJSONデータのmodules
 */
export const generateDot = (modules: IModule[]): string => {
  const generateNodeLabel = (
    segments: string[],
    rootPath: string,
    module: IModule
  ): string => {
    const [segment, ...restSegments] = segments;
    if (segment == null) {
      return "";
    }
    const currentPath = rootPath === "" ? segment : `${rootPath}/${segment}`;
    if (restSegments.length <= 0) {
      const attrs = [
        `label=<${segment}>`,
        module.consolidated ? 'shape="box3d"' : null,
      ].filter((attr) => attr != null);
      return `"${currentPath}" [${attrs.join(" ")}]`;
    }
    return `subgraph "cluster_${currentPath}" { label="${segment}" ${generateNodeLabel(
      restSegments,
      currentPath,
      module
    )} }`;
  };

  const graphStrs = modules
    .map((mod) => {
      return [
        generateNodeLabel(mod.source.split("/"), "", mod),
        ...mod.dependencies.map((dep) => {
          return `"${mod.source}" -> "${dep.resolved}"`;
        }),
      ];
    })
    .flat();

  return [
    'strict digraph "dependency-cruiser output" {',
    getGeneralAttributesStr(),
    "",
    ...graphStrs,
    "}",
  ].join("\n");
};
