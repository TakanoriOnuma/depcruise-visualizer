import { FC, useState, useEffect, useRef } from "react";
import { instance, Viz } from "@viz-js/viz";
import { Box } from "@mui/material";
import type { ICruiseResult } from "dependency-cruiser";
import urlJoin from "url-join";

import { getTitleInElement } from "./getTitleInElement";
import { createTitle2ElementsMap } from "./createTitle2ElementsMap";
import { optimizeModules, OptimizeModulesOption } from "./optimizeModules";
import { generateDot, DotOption } from "./generateDot";

/** アクティブスタイルにするためのクラス名 */
const ACTIVE_CLASS_NAME = "current";
/** ピンで固定するスタイルを設定するためのクラス名 */
const PINNED_CLASS_NAME = "pinned";
/** edgeに装飾するグラデーションの参照ID */
const EDGE_GRADATION_ID = "edgeGradient";

const useViz = (): Viz | null => {
  const [viz, setViz] = useState<Viz | null>(null);

  useEffect(() => {
    instance().then((viz) => setViz(viz));
  }, []);

  return viz;
};

/** グラフオプション */
export type DepcruiseGraphOption = OptimizeModulesOption & DotOption;

export type DepcruiseGraphProps = {
  /** dependency-cruiserを実行して得られるJSONデータ */
  depcruiseResult: ICruiseResult;
  /** グラフ表示のオプション */
  options?: DepcruiseGraphOption;
  /** クラスタークリック時 */
  onClickCluster: (clusterName: string) => void;
};

export const DepcruiseGraph: FC<DepcruiseGraphProps> = ({
  depcruiseResult,
  options,
  onClickCluster,
}) => {
  const viz = useViz();
  const elGraphRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viz == null) {
      return;
    }

    const optimizedModules = optimizeModules(depcruiseResult.modules, options);
    const dot = generateDot(optimizedModules, {
      ...options,
      baseUrl: options?.baseUrl
        ? urlJoin(options.baseUrl, options.startDir ?? "")
        : undefined,
    });

    const svg = viz.renderSVGElement(dot);
    // ハイライト時に設定する用のグラデーションを追加
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

    const nodes = [...svg.querySelectorAll(".node")];
    const edges = [...svg.querySelectorAll(".edge")];
    const title2ElementsMap = createTitle2ElementsMap(nodes, edges);

    const mouseOverHandler = (e: Event) => {
      if (e.target instanceof Element) {
        const closestNodeOrEdge = e.target.closest(".node, .edge");
        if (closestNodeOrEdge) {
          const elements =
            title2ElementsMap[getTitleInElement(closestNodeOrEdge)];
          if (elements) {
            elements.forEach((element) => {
              element.classList.add(ACTIVE_CLASS_NAME);
            });
          }
        }
      }
    };
    const mouseLeaveHandler = () => {
      [...nodes, ...edges].forEach((element) => {
        element.classList.remove(ACTIVE_CLASS_NAME);
      });
    };

    /** 固定でアクティブにする要素のタイトル */
    let pinnedTitle: string | null = null;
    const contextMenuHandler = (e: Event) => {
      e.preventDefault();
      if (e.target instanceof Element) {
        // 一度スタイルをリセットする
        [...nodes, ...edges].forEach((element) => {
          element.classList.remove(PINNED_CLASS_NAME);
        });

        const closestNodeOrEdge = e.target.closest(".node, .edge");
        if (closestNodeOrEdge) {
          const title = getTitleInElement(closestNodeOrEdge);
          if (pinnedTitle === title) {
            pinnedTitle = null;
            return;
          }

          pinnedTitle = title;
          const elements = title2ElementsMap[title];
          if (elements) {
            elements.forEach((element) => {
              element.classList.add(PINNED_CLASS_NAME);
            });
          }
        }
      }
    };
    const keyboardHandler = (e: Event) => {
      if (e instanceof KeyboardEvent) {
        if (e.key === "Escape") {
          pinnedTitle = null;
          [...nodes, ...edges].forEach((element) => {
            element.classList.remove(PINNED_CLASS_NAME);
          });
        }
      }
    };

    [...nodes, ...edges].forEach((node) => {
      node.addEventListener("mouseenter", mouseOverHandler);
      node.addEventListener("mouseleave", mouseLeaveHandler);
      node.addEventListener("contextmenu", contextMenuHandler);
    });
    document.addEventListener("keydown", keyboardHandler);

    const clusters = svg.querySelectorAll(".cluster");
    const clusterClickHandler = (e: Event) => {
      if (e.target instanceof Element) {
        const cluster = e.target.closest(".cluster");
        if (cluster) {
          const title = getTitleInElement(cluster);
          onClickCluster(title.replace("cluster_", ""));
        }
      }
    };
    clusters.forEach((cluster) => {
      cluster.addEventListener("click", clusterClickHandler);
    });

    return () => {
      [...nodes, ...edges].forEach((node) => {
        node.removeEventListener("mouseenter", mouseOverHandler);
        node.removeEventListener("mouseleave", mouseLeaveHandler);
        node.removeEventListener("click", contextMenuHandler);
      });
      document.removeEventListener("keydown", keyboardHandler);
      clusters.forEach((cluster) => {
        cluster.removeEventListener("click", clusterClickHandler);
      });
      svg.remove();
    };
  }, [viz, depcruiseResult, options, onClickCluster]);

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
            `&.${PINNED_CLASS_NAME} path`,
            "&:active polygon",
            "&:hover polygon",
            `&.${ACTIVE_CLASS_NAME} polygon`,
            `&.${PINNED_CLASS_NAME} polygon`,
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
            `&.${PINNED_CLASS_NAME} path`,
            "&:active ellipse",
            "&:hover ellipse",
            `&.${ACTIVE_CLASS_NAME} ellipse`,
            `&.${PINNED_CLASS_NAME} ellipse`,
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
            `&.${PINNED_CLASS_NAME} polygon`,
          ].join(",")]: {
            stroke: "fuchsia",
            strokeWidth: 3,
            fill: "fuchsia",
            strokeOpacity: 1,
            fillOpacity: 1,
          },
        },
        "& .cluster": {
          cursor: "pointer",
          [["&:active path", "&:hover path"].join(",")]: {
            fill: "#ffff0011",
          },
        },
      }}
    />
  );
};
