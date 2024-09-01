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

      // moduleと条件がそれぞれ複数の場合もあるので、配列に統一する
      const value = criteriaTheme.criteria[key];
      const values = Array.isArray(value) ? value : [value];
      const moduleValues = Array.isArray(moduleValue)
        ? moduleValue
        : [moduleValue];

      // いずれかが条件に合致すればtrue
      return moduleValues.some((moduleValue) => {
        return values.some((value) => {
          // 対象の値が完全に一致するか、正規表現で合致する場合はtrue
          return moduleValue === value || new RegExp(value).test(moduleValue);
        });
      });
    });
  });
};
