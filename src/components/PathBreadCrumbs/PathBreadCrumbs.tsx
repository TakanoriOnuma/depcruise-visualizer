import type { FC } from "react";
import { Breadcrumbs, Typography, Link as MuiLink } from "@mui/material";

export type PathBreadCrumbsProps = {
  /** パス */
  path: string;
  onChangePath: (newPath: string) => void;
};

export const PathBreadCrumbs: FC<PathBreadCrumbsProps> = ({
  path,
  onChangePath,
}) => {
  if (path === "") {
    return <Typography sx={{ color: "text.primary" }}>(root)</Typography>;
  }

  const segments = path.split("/");

  return (
    <Breadcrumbs>
      <MuiLink
        underline="hover"
        href="#"
        onClick={(event) => {
          event.preventDefault();
          onChangePath("");
        }}
      >
        (root)
      </MuiLink>
      {segments.map((segment, index) => {
        if (segments.length - 1 === index) {
          return (
            <Typography key={index} sx={{ color: "text.primary" }}>
              {segment}
            </Typography>
          );
        }

        const path = segments.slice(0, index + 1).join("/");
        return (
          <MuiLink
            key={index}
            underline="hover"
            href={`#${path}`}
            onClick={(event) => {
              event.preventDefault();
              onChangePath(path);
            }}
          >
            {segment}
          </MuiLink>
        );
      })}
    </Breadcrumbs>
  );
};
