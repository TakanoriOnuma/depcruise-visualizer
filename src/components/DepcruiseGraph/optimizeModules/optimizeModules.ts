import type { IModule } from "dependency-cruiser";
import { consolidateToPattern } from "./consolidateToPattern";

/**
 * modulesをマージしたり、並び替えたりなどの最適化を行う
 * @param modules - dependency-cruiserのJSONデータのmodules
 */
export const optimizeModules = (
  modules: IModule[],
  options: {
    collapsePattern?: RegExp;
  } = {}
): IModule[] => {
  const mods = options.collapsePattern
    ? consolidateToPattern(modules, options.collapsePattern)
    : modules;

  return [...mods].sort((a, b) => (a.source > b.source ? 1 : -1));
};
