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
  const [depth, setDepth] = useState(3);

  useEffect(() => {
    if (viz == null) {
      return;
    }

    const svg = viz.renderSVGElement(`
strict digraph "dependency-cruiser output"{
    rankdir="LR" splines="true" overlap="false" nodesep="0.16" ranksep="0.18" fontname="Helvetica-bold" fontsize="9" style="rounded,bold,filled" fillcolor="#ffffff" compound="true"
    node [shape="box" style="rounded, filled" height="0.2" color="black" fillcolor="#ffffcc" fontcolor="black" fontname="Helvetica" fontsize="9"]
    edge [arrowhead="normal" arrowsize="0.6" penwidth="2.0" color="#00000033" fontname="Helvetica" fontsize="9"]

    subgraph "cluster_src" {label="src" "src/App.tsx" [label=<App.tsx> tooltip="App.tsx" URL="https://github.com/TakanoriOnuma/trial-dependency-cruiser/blob/main/src/App.tsx" fillcolor="#bbfeff"] }
    "src/App.tsx" -> "src/components/index.ts"
    subgraph "cluster_src" {label="src" subgraph "cluster_src/components" {label="components" subgraph "cluster_src/components/Counter" {label="Counter" "src/components/Counter/Counter.stories.tsx" [label=<Counter.stories.tsx> tooltip="Counter.stories.tsx" URL="https://github.com/TakanoriOnuma/trial-dependency-cruiser/blob/main/src/components/Counter/Counter.stories.tsx" fillcolor="#bbfeff"] } } }
    "src/components/Counter/Counter.stories.tsx" -> "src/components/Counter/Counter.tsx"
    subgraph "cluster_src" {label="src" subgraph "cluster_src/components" {label="components" subgraph "cluster_src/components/Counter" {label="Counter" "src/components/Counter/Counter.tsx" [label=<Counter.tsx> tooltip="Counter.tsx" URL="https://github.com/TakanoriOnuma/trial-dependency-cruiser/blob/main/src/components/Counter/Counter.tsx" fillcolor="#bbfeff"] } } }
    "src/components/Counter/Counter.tsx" -> "src/components/OperandButton/index.ts"
    subgraph "cluster_src" {label="src" subgraph "cluster_src/components" {label="components" subgraph "cluster_src/components/Counter" {label="Counter" "src/components/Counter/index.ts" [label=<index.ts> tooltip="index.ts" URL="https://github.com/TakanoriOnuma/trial-dependency-cruiser/blob/main/src/components/Counter/index.ts" fillcolor="#ddfeff"] } } }
    "src/components/Counter/index.ts" -> "src/components/Counter/Counter.tsx" [arrowhead="inv"]
    "src/components/Counter/index.ts" -> "src/components/Counter/useCounter.ts" [arrowhead="inv"]
    subgraph "cluster_src" {label="src" subgraph "cluster_src/components" {label="components" subgraph "cluster_src/components/Counter" {label="Counter" "src/components/Counter/useCounter.ts" [label=<useCounter.ts> tooltip="useCounter.ts" URL="https://github.com/TakanoriOnuma/trial-dependency-cruiser/blob/main/src/components/Counter/useCounter.ts" fillcolor="#ddfeff"] } } }
    subgraph "cluster_src" {label="src" subgraph "cluster_src/components" {label="components" subgraph "cluster_src/components/LocalCounter" {label="LocalCounter" "src/components/LocalCounter/LocalCounter.stories.tsx" [label=<LocalCounter.stories.tsx> tooltip="LocalCounter.stories.tsx" URL="https://github.com/TakanoriOnuma/trial-dependency-cruiser/blob/main/src/components/LocalCounter/LocalCounter.stories.tsx" fillcolor="#bbfeff"] } } }
    "src/components/LocalCounter/LocalCounter.stories.tsx" -> "src/components/LocalCounter/LocalCounter.tsx"
    subgraph "cluster_src" {label="src" subgraph "cluster_src/components" {label="components" subgraph "cluster_src/components/LocalCounter" {label="LocalCounter" "src/components/LocalCounter/LocalCounter.test.tsx" [label=<LocalCounter.test.tsx> tooltip="LocalCounter.test.tsx" URL="https://github.com/TakanoriOnuma/trial-dependency-cruiser/blob/main/src/components/LocalCounter/LocalCounter.test.tsx" fillcolor="#bbfeff"] } } }
    "src/components/LocalCounter/LocalCounter.test.tsx" -> "src/components/LocalCounter/LocalCounter.stories.tsx"
    subgraph "cluster_src" {label="src" subgraph "cluster_src/components" {label="components" subgraph "cluster_src/components/LocalCounter" {label="LocalCounter" "src/components/LocalCounter/LocalCounter.tsx" [label=<LocalCounter.tsx> tooltip="LocalCounter.tsx" URL="https://github.com/TakanoriOnuma/trial-dependency-cruiser/blob/main/src/components/LocalCounter/LocalCounter.tsx" fillcolor="#bbfeff"] } } }
    "src/components/LocalCounter/LocalCounter.tsx" -> "src/components/Counter/index.ts"
    subgraph "cluster_src" {label="src" subgraph "cluster_src/components" {label="components" subgraph "cluster_src/components/LocalCounter" {label="LocalCounter" "src/components/LocalCounter/index.ts" [label=<index.ts> tooltip="index.ts" URL="https://github.com/TakanoriOnuma/trial-dependency-cruiser/blob/main/src/components/LocalCounter/index.ts" fillcolor="#ddfeff"] } } }
    "src/components/LocalCounter/index.ts" -> "src/components/LocalCounter/LocalCounter.tsx" [arrowhead="inv"]
    subgraph "cluster_src" {label="src" subgraph "cluster_src/components" {label="components" subgraph "cluster_src/components/OperandButton" {label="OperandButton" "src/components/OperandButton/OperandButton.tsx" [label=<OperandButton.tsx> tooltip="OperandButton.tsx" URL="https://github.com/TakanoriOnuma/trial-dependency-cruiser/blob/main/src/components/OperandButton/OperandButton.tsx" fillcolor="#bbfeff"] } } }
    subgraph "cluster_src" {label="src" subgraph "cluster_src/components" {label="components" subgraph "cluster_src/components/OperandButton" {label="OperandButton" "src/components/OperandButton/index.ts" [label=<index.ts> tooltip="index.ts" URL="https://github.com/TakanoriOnuma/trial-dependency-cruiser/blob/main/src/components/OperandButton/index.ts" fillcolor="#ddfeff"] } } }
    "src/components/OperandButton/index.ts" -> "src/components/OperandButton/OperandButton.tsx" [arrowhead="inv"]
    subgraph "cluster_src" {label="src" subgraph "cluster_src/components" {label="components" "src/components/index.ts" [label=<index.ts> tooltip="index.ts" URL="https://github.com/TakanoriOnuma/trial-dependency-cruiser/blob/main/src/components/index.ts" fillcolor="#ddfeff"] } }
    "src/components/index.ts" -> "src/components/Counter/index.ts" [arrowhead="inv"]
    "src/components/index.ts" -> "src/components/LocalCounter/index.ts" [arrowhead="inv"]
    "src/components/index.ts" -> "src/components/OperandButton/index.ts" [arrowhead="inv"]
    subgraph "cluster_src" {label="src" "src/main.tsx" [label=<main.tsx> tooltip="main.tsx" URL="https://github.com/TakanoriOnuma/trial-dependency-cruiser/blob/main/src/main.tsx" fillcolor="#bbfeff"] }
    "src/main.tsx" -> "src/App.tsx"
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
