import DepcruiseResultJson from "../../debug/dependency-result.json";

/** dependency-cruiserを実行して得られるJSONデータ */
type DepcruiseResult = typeof DepcruiseResultJson;

/**
 * JSONデータからGraphvizのDOT言語の文字列を生成する
 * @param depcruiseResult - dependency-cruiserを実行して得られるJSONデータ
 */
export const generateDot = (depcruiseResult: DepcruiseResult) => {
  const generateNodeLabel = (segments: string[], rootPath: string): string => {
    const [segment, ...restSegments] = segments;
    if (segment == null) {
      return "";
    }
    const currentPath = rootPath === "" ? segment : `${rootPath}/${segment}`;
    if (restSegments.length <= 0) {
      return `"${currentPath}" [label=<${segment}>]`;
    }
    return `subgraph "cluster_${currentPath}" { label="${segment}" ${generateNodeLabel(
      restSegments,
      currentPath
    )} }`;
  };

  const graphStrs = depcruiseResult.modules
    .map((mod) => {
      return [
        generateNodeLabel(mod.source.split("/"), ""),
        ...mod.dependencies.map((dep) => {
          return `"${mod.source}" -> "${dep.resolved}"`;
        }),
      ];
    })
    .flat();

  return [
    'strict digraph "dependency-cruiser output" {',
    '  rankdir="LR" splines="true" overlap="false" nodesep="0.16" ranksep="0.18" fontname="Helvetica-bold" fontsize="9" style="rounded,bold,filled" fillcolor="#ffffff" compound="true"',
    '  node [shape="box" style="rounded, filled" height="0.2" color="black" fillcolor="#ffffcc" fontcolor="black" fontname="Helvetica" fontsize="9"]',
    '  edge [arrowhead="normal" arrowsize="0.6" penwidth="2.0" color="#00000033" fontname="Helvetica" fontsize="9"]',
    "",
    ...graphStrs,
    "}",
  ].join("\n");
};
