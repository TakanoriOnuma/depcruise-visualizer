import type { IModule } from "dependency-cruiser";

/**
 * modulesをマージしたり、並び替えたりなどの最適化を行う
 * @param modules - dependency-cruiserのJSONデータのmodules
 */
export const optimizeModules = (modules: IModule[]): IModule[] => {
  return [...modules].sort((a, b) => (a.source > b.source ? 1 : -1));
};
