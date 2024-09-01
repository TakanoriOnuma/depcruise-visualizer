import urlJoin from "url-join";

import type { IDependency, IModule } from "dependency-cruiser";
import { DOT_THEME, CriteriaTheme } from "./dotTheme";
import { filterMatchThemes } from "./filterMatchThemes";

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
 * moduleの属性を取得する
 * @param module - dependency-cruiserのmodule
 */
const getModuleAttributes = (module: IModule): CriteriaTheme["attributes"] => {
  return filterMatchThemes(DOT_THEME.modules, module).reduce(
    (attrObj, criteriaTheme) => {
      return {
        // プロパティは先勝ちにしたいので、ループ変数のattributesを上書きする形でマージする
        ...criteriaTheme.attributes,
        ...attrObj,
      };
    },
    {} as CriteriaTheme["attributes"]
  );
};

/**
 * dependencyの属性を取得する
 * @param dependency - depdency-cruiserのdependency
 */
const getDependencyAttributes = (
  dependency: IDependency
): CriteriaTheme["attributes"] => {
  return filterMatchThemes(DOT_THEME.dependencies, dependency).reduce(
    (attrObj, criteriaTheme) => {
      return {
        // プロパティは先勝ちにしたいので、ループ変数のattributesを上書きする形でマージする
        ...criteriaTheme.attributes,
        ...attrObj,
      };
    },
    {} as CriteriaTheme["attributes"]
  );
};

export type DotOption = {
  /** 外部リンクを指定する際のURL */
  baseUrl?: string;
};

/**
 * JSONデータからGraphvizのDOT言語の文字列を生成する
 * @param modules - dependency-cruiserを実行して得られるJSONデータのmodules
 */
export const generateDot = (
  modules: IModule[],
  { baseUrl }: DotOption = {}
): string => {
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
      const moduleAttrs = getModuleAttributes(module);
      const urlAttrs: CriteriaTheme["attributes"] =
        baseUrl != null
          ? { URL: urlJoin(baseUrl, currentPath), target: "_blank" }
          : {};

      return `"${currentPath}" [label=<${segment}> ${attributizeObject({
        ...moduleAttrs,
        ...urlAttrs,
      })}]`;
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
          const dependencyAttrs = getDependencyAttributes(dep);

          const dependencyArrowStr = `"${mod.source}" -> "${dep.resolved}"`;
          if (Object.keys(dependencyAttrs).length <= 0) {
            return dependencyArrowStr;
          }

          const ruleName = dep.rules?.[0]?.name;
          const ruleAttrs: CriteriaTheme["attributes"] =
            ruleName != null
              ? {
                  xlabel: ruleName,
                  tooltip: ruleName,
                }
              : {};
          return `${dependencyArrowStr} [${attributizeObject({
            ...ruleAttrs,
            ...dependencyAttrs,
          })}]`;
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
