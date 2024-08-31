import type { IModule, IDependency, SeverityType } from "dependency-cruiser";
import { uniq, uniqBy } from "lodash-es";

/** severityの表示順 */
const SEVERITY_ORDER: SeverityType[] = ["error", "warn", "info", "ignore"];

/**
 * 同じsourceのmoduleを統合する
 * @param modules - dependency-cruiserのJSONデータのmodules
 */
const consolidateModules = (modules: IModule[]): IModule[] => {
  let tempModules: IModule[] = structuredClone(modules);
  const resultModules: IModule[] = [];

  /**
   * 対象のsourceに対して一致するmoduleを統合する
   * @param source - 統合するmoduleのsource
   */
  const mergeModuleBySource = (source: string): IModule => {
    const targetModules = tempModules.filter(
      (module) => module.source === source
    );
    const mergedModule = targetModules.reduce(
      (mergedModule: IModule, module: IModule) => {
        return {
          ...mergedModule,
          ...module,
          dependencies: uniqBy(
            mergedModule.dependencies.concat(module.dependencies),
            (dependency) => dependency.resolved
          ),
          rules: mergedModule.rules
            ?.concat(module.rules ?? [])
            .sort((leftRule, rightRule) => {
              return (
                SEVERITY_ORDER.indexOf(leftRule.severity) -
                SEVERITY_ORDER.indexOf(rightRule.severity)
              );
            }),
          valid: mergedModule.valid && module.valid,
          consolidated: Boolean(
            mergedModule.consolidated || module.consolidated
          ),
        };
      }
    );
    return mergedModule;
  };

  while (tempModules.length > 0) {
    const currentModule = tempModules[0];
    if (currentModule == null) {
      break;
    }

    const mergedModule = mergeModuleBySource(currentModule.source);
    resultModules.push(mergedModule);

    tempModules = tempModules.filter(
      (module) => module.source !== currentModule.source
    );
  }

  return resultModules;
};

/**
 * 同じresolvedのdependencyを統合する
 * @param dependencies - dependency-cruiserのJSONデータのdependencies
 */
const consolidateModuleDependencies = (
  dependencies: IDependency[]
): IDependency[] => {
  let tempDependencies: IDependency[] = structuredClone(dependencies);
  const resultDependencies: IDependency[] = [];

  const mergeDependencyByResolved = (resolved: string): IDependency => {
    const targetDependencies = tempDependencies.filter(
      (dependency) => dependency.resolved === resolved
    );
    const mergedDependency = targetDependencies.reduce(
      (mergedDependency: IDependency, dependency: IDependency) => {
        return {
          ...mergedDependency,
          ...dependency,
          dependencyTypes: uniq(
            mergedDependency.dependencyTypes.concat(dependency.dependencyTypes)
          ),
          rules: mergedDependency.rules
            ?.concat(dependency.rules ?? [])
            .sort((leftRule, rightRule) => {
              return (
                SEVERITY_ORDER.indexOf(leftRule.severity) -
                SEVERITY_ORDER.indexOf(rightRule.severity)
              );
            }),
          valid: mergedDependency.valid && dependency.valid,
        };
      }
    );
    return mergedDependency;
  };

  while (tempDependencies.length > 0) {
    const currentDependency = tempDependencies[0];
    if (currentDependency == null) {
      break;
    }

    const mergedDependency = mergeDependencyByResolved(
      currentDependency.resolved
    );
    resultDependencies.push(mergedDependency);

    tempDependencies = tempDependencies.filter(
      (dependency) => dependency.resolved !== currentDependency.resolved
    );
  }

  return resultDependencies;
};

/**
 * modulesをcollapsePatternに従って統合する
 * @param modules - dependency-cruiserのJSONデータのmodules
 * @param collapsePattern - 統合するパターン
 * @note 実装は以下を参考にする
 * @see https://github.com/sverweij/dependency-cruiser/blob/v16.4.0/src/graph-utl/consolidate-to-pattern.mjs#L47-L51
 */
export const consolidateToPattern = (
  modules: IModule[],
  collapsePattern: RegExp
): IModule[] => {
  /** moduleのsourceやdependencyのresolvedをcollapsePatternにマッチした文字列に置き換わったmodules */
  const squashedModules = modules.map((module) => {
    const match = module.source.match(collapsePattern);
    return {
      ...module,
      source: match ? match[0] : module.source,
      consolidated:
        module.consolidated ||
        (match != null ? match[0] !== module.source : false),
      dependencies: module.dependencies.map((dependency) => {
        const match = dependency.resolved.match(collapsePattern);
        return {
          ...dependency,
          resolved: match ? match[0] : dependency.resolved,
        };
      }),
    };
  });

  // collapsePatternによってsourceが同じ文字列になったmoduleを統合する
  const consolidatedModules = consolidateModules(squashedModules);

  return consolidatedModules.map((module) => {
    return {
      ...module,
      // collapsePatternによってresolvedが同じ文字列になったdependencyを統合する
      dependencies: consolidateModuleDependencies(module.dependencies)
        // 統合したことで同じmoduleを指してしまったdependencyは除外する
        .filter((dependency) => dependency.resolved !== module.source),
    };
  });
};
