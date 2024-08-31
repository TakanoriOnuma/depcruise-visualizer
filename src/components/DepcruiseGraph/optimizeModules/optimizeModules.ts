import type { IModule } from "dependency-cruiser";
import { consolidateToPattern } from "./consolidateToPattern";

export type OptimizeModulesOption = {
  /** グラフ表示の起点となるディレクトリパス */
  startDir?: string;
  /** 表示する深さ（depth以降はboxでまとめられる） */
  depth?: number;
};

/**
 * modulesをマージしたり、並び替えたりなどの最適化を行う
 * @param modules - dependency-cruiserのJSONデータのmodules
 */
export const optimizeModules = (
  modules: IModule[],
  { startDir, depth }: OptimizeModulesOption = {}
): IModule[] => {
  /** startDirから始まるようにパスを変更する */
  const filteredModules = startDir
    ? modules
        .map((module) => {
          const regexp = new RegExp(`^${startDir}/`);
          return {
            ...module,
            source: regexp.test(module.source)
              ? module.source.replace(new RegExp(`^${startDir}/`), "")
              : "",
            dependencies: module.dependencies
              .map((dependency) => {
                return {
                  ...dependency,
                  resolved: regexp.test(dependency.resolved)
                    ? dependency.resolved.replace(
                        new RegExp(`^${startDir}/`),
                        ""
                      )
                    : "",
                };
              })
              .filter((dependency) => dependency.resolved !== ""),
          };
        })
        .filter((module) => {
          return module.source !== "";
        })
    : modules;

  const mods =
    depth != null && depth > 0
      ? consolidateToPattern(
          filteredModules,
          new RegExp("^" + "[^/]+/".repeat(depth).slice(0, -1))
        )
      : filteredModules;

  return [...mods].sort((a, b) => (a.source > b.source ? 1 : -1));
};
