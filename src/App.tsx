import { FC, useState, useMemo, useCallback } from "react";
import { Box, Stack, TextField, Typography, Button } from "@mui/material";
import { clamp } from "lodash-es";

import depcruiseResult from "./debug/dependency-result.json";
import { DepcruiseGraph } from "./components/DepcruiseGraph";
import { OptimizeModulesOption } from "./components/DepcruiseGraph/optimizeModules";
import { DebugDotGraph } from "./components/DebugDotGraph";

export const App: FC = () => {
  const [startDir, setStartDir] = useState("");
  const [depth, setDepth] = useState(4);

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
      {import.meta.env.DEV && (
        <>
          <hr />
          <DebugDotGraph />
        </>
      )}
    </Box>
  );
};
