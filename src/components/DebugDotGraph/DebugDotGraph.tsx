import { Box } from "@mui/material";
import { instance, Viz } from "@viz-js/viz";
import { useState, useEffect, useRef } from "react";

import dotText from "../../debug/dependency-result.dot?raw";

const useViz = (): Viz | null => {
  const [viz, setViz] = useState<Viz | null>(null);

  useEffect(() => {
    instance().then((viz) => setViz(viz));
  }, []);

  return viz;
};

export const DebugDotGraph = () => {
  const viz = useViz();
  const elDebugGraphRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (viz == null) {
      return;
    }

    const svg = viz.renderSVGElement(dotText);
    elDebugGraphRef.current?.appendChild(svg);

    return () => {
      svg.remove();
    };
  }, [viz]);

  return (
    <Box>
      <Box>DOT言語のコードを直接表示</Box>
      <Box ref={elDebugGraphRef} />
    </Box>
  );
};
