import { FC, useState, useMemo, useCallback } from "react";
import { Box, Stack, TextField, Typography } from "@mui/material";
import { clamp } from "lodash-es";

import depcruiseResult from "./debug/dependency-result.json";
import { DepcruiseGraph } from "./components/DepcruiseGraph";
import type { DepcruiseGraphOption } from "./components/DepcruiseGraph";
import { DebugDotGraph } from "./components/DebugDotGraph";
import { PathBreadCrumbs } from "./components/PathBreadCrumbs";

export const App: FC = () => {
  const [baseUrl, setBaseUrl] = useState(
    "https://github.com/TakanoriOnuma/depcruise-visualizer/tree/main"
  );
  const [startDir, setStartDir] = useState("");
  const [depth, setDepth] = useState(4);

  const options: DepcruiseGraphOption = useMemo(() => {
    return { startDir, depth, baseUrl };
  }, [startDir, depth, baseUrl]);

  const handleClickCluster = useCallback((clusterName: string) => {
    setStartDir((prev) =>
      prev !== "" ? [prev, clusterName].join("/") : clusterName
    );
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography>BaseUrl: </Typography>
          <TextField
            fullWidth
            value={baseUrl}
            size="small"
            onChange={(event) => {
              setBaseUrl(event.target.value);
            }}
          />
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography>StartDir: </Typography>
          <PathBreadCrumbs
            path={startDir}
            onChangePath={(newPath) => {
              setStartDir(newPath);
            }}
          />
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
      <hr />
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
