import { IModule, IDependency } from "dependency-cruiser";
import { get } from "lodash-es";
import type { CriteriaTheme } from "./dotTheme";

/**
 * 対象のmoduleまたはdependencyに合致する条件付きテーマのみに絞る
 * @param criteriaThemes - 条件付きテーマリスト
 * @param module - dependency-cruiserのmoduleまたはdependency
 * @see https://github.com/sverweij/dependency-cruiser/blob/v16.4.0/src/report/dot/theming.mjs#L51-L58
 */
export const filterMatchThemes = (
  criteriaThemes: CriteriaTheme[],
  module: IModule | IDependency
) => {
  return criteriaThemes.filter((criteriaTheme) => {
    return Object.keys(criteriaTheme.criteria).every((key) => {
      // そもそも対象のmoduleにkeyが存在しない場合はfalse
      const moduleValue = get(module, key);
      if (moduleValue === undefined) {
        return false;
      }

      // 対象の値が完全に合致するか、正規表現で合致する場合はtrue
      const value = criteriaTheme.criteria[key];
      return moduleValue === value || new RegExp(value).test(moduleValue);
    });
  });
};
