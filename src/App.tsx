import { FC, useRef, useState, useEffect, useMemo, useCallback } from "react";
import { instance, Viz } from "@viz-js/viz";
import { Box, Stack, TextField, Typography, Button } from "@mui/material";
import { clamp } from "lodash-es";

import depcruiseResult from "./debug/dependency-result.json";
import { DepcruiseGraph } from "./components/DepcruiseGraph";
import { OptimizeModulesOption } from "./components/DepcruiseGraph/optimizeModules";

const useViz = (): Viz | null => {
  const [viz, setViz] = useState<Viz | null>(null);

  useEffect(() => {
    instance().then((viz) => setViz(viz));
  }, []);

  return viz;
};

export const App: FC = () => {
  const viz = useViz();
  const elDebugGraphRef = useRef<HTMLDivElement>(null);
  const [startDir, setStartDir] = useState("");
  const [depth, setDepth] = useState(4);

  useEffect(() => {
    if (viz == null) {
      return;
    }

    const svg = viz.renderSVGElement(`
strict digraph "dependency-cruiser output"{
    rankdir="LR" splines="true" overlap="false" nodesep="0.16" ranksep="0.18" fontname="Helvetica-bold" fontsize="9" style="rounded,bold,filled" fillcolor="#ffffff" compound="true"
    node [shape="box" style="rounded, filled" height="0.2" color="black" fillcolor="#ffffcc" fontcolor="black" fontname="Helvetica" fontsize="9"]
    edge [arrowhead="normal" arrowsize="0.6" penwidth="2.0" color="#00000033" fontname="Helvetica" fontsize="9"]

    subgraph "cluster_src" {label="src" "src/App.tsx" [label=<App.tsx> tooltip="App.tsx" URL="https://github.com/TakanoriOnuma/depcruise-visualizer/blob/main/src/App.tsx" fillcolor="#bbfeff"] }
    "src/App.tsx" -> "src/components/DepcruiseGraph/index.ts"
    "src/App.tsx" -> "src/components/DepcruiseGraph/optimizeModules/index.ts"
    "src/App.tsx" -> "src/debug/dependency-result.json"
    subgraph "cluster_src" {label="src" subgraph "cluster_src/components" {label="components" subgraph "cluster_src/components/DepcruiseGraph" {label="DepcruiseGraph" "src/components/DepcruiseGraph/DepcruiseGraph.tsx" [label=<DepcruiseGraph.tsx> tooltip="DepcruiseGraph.tsx" URL="https://github.com/TakanoriOnuma/depcruise-visualizer/blob/main/src/components/DepcruiseGraph/DepcruiseGraph.tsx" fillcolor="#bbfeff"] } } }
    "src/components/DepcruiseGraph/DepcruiseGraph.tsx" -> "src/components/DepcruiseGraph/createTitle2ElementsMap.ts"
    "src/components/DepcruiseGraph/DepcruiseGraph.tsx" -> "src/components/DepcruiseGraph/generateDot/index.ts"
    "src/components/DepcruiseGraph/DepcruiseGraph.tsx" -> "src/components/DepcruiseGraph/getTitleInElement.ts"
    "src/components/DepcruiseGraph/DepcruiseGraph.tsx" -> "src/components/DepcruiseGraph/optimizeModules/index.ts"
    subgraph "cluster_src" {label="src" subgraph "cluster_src/components" {label="components" subgraph "cluster_src/components/DepcruiseGraph" {label="DepcruiseGraph" "src/components/DepcruiseGraph/createTitle2ElementsMap.ts" [label=<createTitle2ElementsMap.ts> tooltip="createTitle2ElementsMap.ts" URL="https://github.com/TakanoriOnuma/depcruise-visualizer/blob/main/src/components/DepcruiseGraph/createTitle2ElementsMap.ts" fillcolor="#ddfeff"] } } }
    "src/components/DepcruiseGraph/createTitle2ElementsMap.ts" -> "src/components/DepcruiseGraph/getTitleInElement.ts"
    subgraph "cluster_src" {label="src" subgraph "cluster_src/components" {label="components" subgraph "cluster_src/components/DepcruiseGraph" {label="DepcruiseGraph" subgraph "cluster_src/components/DepcruiseGraph/generateDot" {label="generateDot" "src/components/DepcruiseGraph/generateDot/dotTheme.ts" [label=<dotTheme.ts> tooltip="dotTheme.ts" URL="https://github.com/TakanoriOnuma/depcruise-visualizer/blob/main/src/components/DepcruiseGraph/generateDot/dotTheme.ts" fillcolor="#ddfeff"] } } } }
    subgraph "cluster_src" {label="src" subgraph "cluster_src/components" {label="components" subgraph "cluster_src/components/DepcruiseGraph" {label="DepcruiseGraph" subgraph "cluster_src/components/DepcruiseGraph/generateDot" {label="generateDot" "src/components/DepcruiseGraph/generateDot/filterMatchThemes.ts" [label=<filterMatchThemes.ts> tooltip="filterMatchThemes.ts" URL="https://github.com/TakanoriOnuma/depcruise-visualizer/blob/main/src/components/DepcruiseGraph/generateDot/filterMatchThemes.ts" fillcolor="#ddfeff"] } } } }
    "src/components/DepcruiseGraph/generateDot/filterMatchThemes.ts" -> "src/components/DepcruiseGraph/generateDot/dotTheme.ts" [arrowhead="onormal" penwidth="1.0"]
    subgraph "cluster_src" {label="src" subgraph "cluster_src/components" {label="components" subgraph "cluster_src/components/DepcruiseGraph" {label="DepcruiseGraph" subgraph "cluster_src/components/DepcruiseGraph/generateDot" {label="generateDot" "src/components/DepcruiseGraph/generateDot/generateDot.ts" [label=<generateDot.ts> tooltip="generateDot.ts" URL="https://github.com/TakanoriOnuma/depcruise-visualizer/blob/main/src/components/DepcruiseGraph/generateDot/generateDot.ts" fillcolor="#ddfeff"] } } } }
    "src/components/DepcruiseGraph/generateDot/generateDot.ts" -> "src/components/DepcruiseGraph/generateDot/dotTheme.ts"
    "src/components/DepcruiseGraph/generateDot/generateDot.ts" -> "src/components/DepcruiseGraph/generateDot/filterMatchThemes.ts"
    subgraph "cluster_src" {label="src" subgraph "cluster_src/components" {label="components" subgraph "cluster_src/components/DepcruiseGraph" {label="DepcruiseGraph" subgraph "cluster_src/components/DepcruiseGraph/generateDot" {label="generateDot" "src/components/DepcruiseGraph/generateDot/index.ts" [label=<index.ts> tooltip="index.ts" URL="https://github.com/TakanoriOnuma/depcruise-visualizer/blob/main/src/components/DepcruiseGraph/generateDot/index.ts" fillcolor="#ddfeff"] } } } }
    "src/components/DepcruiseGraph/generateDot/index.ts" -> "src/components/DepcruiseGraph/generateDot/generateDot.ts" [arrowhead="inv"]
    subgraph "cluster_src" {label="src" subgraph "cluster_src/components" {label="components" subgraph "cluster_src/components/DepcruiseGraph" {label="DepcruiseGraph" "src/components/DepcruiseGraph/getTitleInElement.ts" [label=<getTitleInElement.ts> tooltip="getTitleInElement.ts" URL="https://github.com/TakanoriOnuma/depcruise-visualizer/blob/main/src/components/DepcruiseGraph/getTitleInElement.ts" fillcolor="#ddfeff"] } } }
    subgraph "cluster_src" {label="src" subgraph "cluster_src/components" {label="components" subgraph "cluster_src/components/DepcruiseGraph" {label="DepcruiseGraph" "src/components/DepcruiseGraph/index.ts" [label=<index.ts> tooltip="index.ts" URL="https://github.com/TakanoriOnuma/depcruise-visualizer/blob/main/src/components/DepcruiseGraph/index.ts" fillcolor="#ddfeff"] } } }
    "src/components/DepcruiseGraph/index.ts" -> "src/components/DepcruiseGraph/DepcruiseGraph.tsx" [arrowhead="inv"]
    subgraph "cluster_src" {label="src" subgraph "cluster_src/components" {label="components" subgraph "cluster_src/components/DepcruiseGraph" {label="DepcruiseGraph" subgraph "cluster_src/components/DepcruiseGraph/optimizeModules" {label="optimizeModules" "src/components/DepcruiseGraph/optimizeModules/consolidateToPattern.ts" [label=<consolidateToPattern.ts> tooltip="consolidateToPattern.ts" URL="https://github.com/TakanoriOnuma/depcruise-visualizer/blob/main/src/components/DepcruiseGraph/optimizeModules/consolidateToPattern.ts" fillcolor="#ddfeff"] } } } }
    subgraph "cluster_src" {label="src" subgraph "cluster_src/components" {label="components" subgraph "cluster_src/components/DepcruiseGraph" {label="DepcruiseGraph" subgraph "cluster_src/components/DepcruiseGraph/optimizeModules" {label="optimizeModules" "src/components/DepcruiseGraph/optimizeModules/index.ts" [label=<index.ts> tooltip="index.ts" URL="https://github.com/TakanoriOnuma/depcruise-visualizer/blob/main/src/components/DepcruiseGraph/optimizeModules/index.ts" fillcolor="#ddfeff"] } } } }
    "src/components/DepcruiseGraph/optimizeModules/index.ts" -> "src/components/DepcruiseGraph/optimizeModules/optimizeModules.ts" [arrowhead="inv"]
    subgraph "cluster_src" {label="src" subgraph "cluster_src/components" {label="components" subgraph "cluster_src/components/DepcruiseGraph" {label="DepcruiseGraph" subgraph "cluster_src/components/DepcruiseGraph/optimizeModules" {label="optimizeModules" "src/components/DepcruiseGraph/optimizeModules/optimizeModules.ts" [label=<optimizeModules.ts> tooltip="optimizeModules.ts" URL="https://github.com/TakanoriOnuma/depcruise-visualizer/blob/main/src/components/DepcruiseGraph/optimizeModules/optimizeModules.ts" fillcolor="#ddfeff"] } } } }
    "src/components/DepcruiseGraph/optimizeModules/optimizeModules.ts" -> "src/components/DepcruiseGraph/optimizeModules/consolidateToPattern.ts"
    subgraph "cluster_src" {label="src" subgraph "cluster_src/debug" {label="debug" "src/debug/dependency-result.json" [label=<dependency-result.json> tooltip="dependency-result.json" URL="https://github.com/TakanoriOnuma/depcruise-visualizer/blob/main/src/debug/dependency-result.json" fillcolor="#ffee44"] } }
    subgraph "cluster_src" {label="src" "src/index.css" [label=<index.css> tooltip="index.css" URL="https://github.com/TakanoriOnuma/depcruise-visualizer/blob/main/src/index.css" ] }
    subgraph "cluster_src" {label="src" "src/main.tsx" [label=<main.tsx> tooltip="main.tsx" URL="https://github.com/TakanoriOnuma/depcruise-visualizer/blob/main/src/main.tsx" fillcolor="#bbfeff"] }
    "src/main.tsx" -> "src/App.tsx"
    "src/main.tsx" -> "src/index.css"
    "src/main.tsx" -> "src/theme.ts"
    subgraph "cluster_src" {label="src" "src/theme.ts" [label=<theme.ts> tooltip="theme.ts" URL="https://github.com/TakanoriOnuma/depcruise-visualizer/blob/main/src/theme.ts" fillcolor="#ddfeff"] }
    subgraph "cluster_src" {label="src" "src/vite-env.d.ts" [label=<vite-env.d.ts> tooltip="vite-env.d.ts" URL="https://github.com/TakanoriOnuma/depcruise-visualizer/blob/main/src/vite-env.d.ts" fillcolor="#ccffcc"] }
}
`);
    elDebugGraphRef.current?.appendChild(svg);

    return () => {
      svg.remove();
    };
  }, [viz]);

  const options: OptimizeModulesOption = useMemo(() => {
    return { startDir, depth };
  }, [startDir, depth]);

  const handleClickCluster = useCallback((clusterName: string) => {
    setStartDir((prev) =>
      prev !== "" ? [prev, clusterName].join("/") : clusterName
    );
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" spacing={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography>StartDir: {startDir || "/"}</Typography>
          <Button
            variant="outlined"
            disabled={startDir === ""}
            onClick={() => {
              setStartDir("");
            }}
          >
            リセット
          </Button>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography component="label">Depth:</Typography>
          <TextField
            sx={{ width: 100 }}
            value={depth}
            type="number"
            size="small"
            onChange={(event) => {
              setDepth(clamp(Number(event.target.value), 0, 10));
            }}
          />
        </Stack>
      </Stack>
      <DepcruiseGraph
        depcruiseResult={depcruiseResult as any}
        options={options}
        onClickCluster={handleClickCluster}
      />
      <div ref={elDebugGraphRef} />
    </Box>
  );
};
