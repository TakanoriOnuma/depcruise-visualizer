import { FC, useState, useEffect, useRef } from "react";
import { instance, Viz } from "@viz-js/viz";
import { Box } from "@mui/material";

import DepcruiseResultJson from "../../debug/dependency-result.json";

/** アクティブスタイルにするためのクラス名 */
const ACTIVE_CLASS_NAME = "current";
/** edgeに装飾するグラデーションの参照ID */
const EDGE_GRADATION_ID = "edgeGradient";

/** dependency-cruiserを実行して得られるJSONデータ */
type DepcruiseResult = typeof DepcruiseResultJson;

const useViz = (): Viz | null => {
  const [viz, setViz] = useState<Viz | null>(null);

  useEffect(() => {
    instance().then((viz) => setViz(viz));
  }, []);

  return viz;
};

/**
 * JSONデータからGraphvizのDOT言語の文字列を生成する
 * @param depcruiseResult - dependency-cruiserを実行して得られるJSONデータ
 */
const generateDot = (depcruiseResult: DepcruiseResult) => {
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

export type DepcruiseGraphProps = {
  /** dependency-cruiserを実行して得られるJSONデータ */
  depcruiseResult: DepcruiseResult;
};

export const DepcruiseGraph: FC<DepcruiseGraphProps> = ({
  depcruiseResult,
}) => {
  const viz = useViz();
  const elGraphRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viz == null) {
      return;
    }

    const dot = generateDot(depcruiseResult);
    console.log(dot);

    const svg = viz.renderSVGElement(dot);
    // @see https://github.com/sverweij/dependency-cruiser/blob/v16.4.0/src/report/dot-webpage/svg-in-html-snippets/script.cjs#L255-L262
    svg.insertAdjacentHTML(
      "afterbegin",
      `<linearGradient id="${EDGE_GRADATION_ID}">
        <stop offset="0%" stop-color="fuchsia"/>
        <stop offset="100%" stop-color="purple"/>
      </linearGradient>
      `
    );
    elGraphRef.current?.appendChild(svg);

    const nodes = svg.querySelectorAll(".node");
    const edges = svg.querySelectorAll(".edge");
    console.log(nodes);

    const mouseOverHandler = (e: Event) => {
      console.log("enter", e);
      if (e.target instanceof Element) {
        const closestNodeOrEdge = e.target.closest(".node, .edge");
        console.log(closestNodeOrEdge);
      }
    };
    const mouseLeaveHandler = (e: Event) => {
      console.log("leave", e);
    };

    nodes.forEach((node) => {
      node.addEventListener("mouseenter", mouseOverHandler);
      node.addEventListener("mouseleave", mouseLeaveHandler);
    });

    return () => {
      nodes.forEach((node) => {
        node.removeEventListener("mouseenter", mouseOverHandler);
        node.removeEventListener("mouseleave", mouseLeaveHandler);
      });
      svg.remove();
    };
  }, [viz, depcruiseResult]);

  return (
    <Box
      ref={elGraphRef}
      sx={{
        // この辺のCSSを参考に設定する
        // @see https://github.com/sverweij/dependency-cruiser/blob/v16.4.0/src/report/dot-webpage/svg-in-html-snippets/style.css#L1-L9
        "& .node": {
          [[
            "&:active path",
            "&:hover path",
            `&.${ACTIVE_CLASS_NAME} path`,
            "&:active polygon",
            "&:hover polygon",
            `&.${ACTIVE_CLASS_NAME} polygon`,
          ].join(",")]: {
            stroke: "fuchsia",
            strokeWidth: 2,
          },
        },
        "& .edge": {
          [[
            "&:active path",
            "&:hover path",
            `&.${ACTIVE_CLASS_NAME} path`,
            "&:active ellipse",
            "&:hover ellipse",
            `&.${ACTIVE_CLASS_NAME} ellipse`,
          ].join(",")]: {
            // グラデーションを使うとエッジが見えなくなる時があるので、一旦コメントアウト
            // stroke: `url(#${EDGE_GRADATION_ID})`,
            stroke: "fuchsia",
            strokeWidth: 3,
            strokeOpacity: 1,
          },
          [[
            "&:active polygon",
            "&:hover polygon",
            `&.${ACTIVE_CLASS_NAME} polygon`,
          ].join(",")]: {
            stroke: "fuchsia",
            strokeWidth: 3,
            fill: "fuchsia",
            strokeOpacity: 1,
            fillOpacity: 1,
          },
        },
        "& .cluster": {
          [["&:active path", "&:hover path"].join(",")]: {
            fill: "#ffff0011",
          },
        },
      }}
    />
  );
};
