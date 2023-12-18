import _ from 'lodash';
import type { IExtractedConcentration } from '@padoa/chemical-risk';

import type { IText } from '@topics/engine/model/fds.model.js';
import { CommonRegexRulesService } from '@topics/engine/rules/extraction-rules/common-regex-rules.service.js';
import { TextCleanerService } from '@topics/engine/text-cleaner.service.js';

export class ConcentrationRulesService {
  public static getConcentrations(linesSplittedByColumns: IText[][][]): IExtractedConcentration[] {
    const concentrationByColumns = _.map(linesSplittedByColumns, (lines) => this.getConcentrationsInColumn(lines));
    return _(concentrationByColumns)
      .maxBy('length')
      .map((concentration) => ({ ...concentration, value: TextCleanerService.trimAndCleanMultipleSpaces(concentration.value) }));
  }

  public static getConcentrationsInColumn(lines: IText[][]): IExtractedConcentration[] {
    const concentrations = [];
    for (const texts of lines) {
      const lineText = texts.map(({ cleanContent }) => cleanContent).join('');
      const concentration = this.getConcentration(lineText);
      if (concentration)
        concentrations.push({
          value: concentration,
          metaData: { startBox: _.pick(texts[0], ['pageNumber', 'xPositionProportion', 'yPositionProportion']) },
        });
    }
    return concentrations;
  }

  private static readonly SPACE_REGEX = CommonRegexRulesService.SPACE_REGEX;
  private static readonly ORDER_OPERATORS_REGEX = CommonRegexRulesService.ORDER_OPERATORS_REGEX;
  private static readonly DECIMAL_DIGIT_REGEX = `((\\d{1,2}${this.SPACE_REGEX}[\\.,]${this.SPACE_REGEX}\\d+)|(100|\\d{1,2}))`;

  private static readonly NEGATIVE_LOOK_BEFORE_REGEX = `(?<!([-/•]${this.SPACE_REGEX}|\\d))`;
  private static readonly NEGATIVE_LOOK_AHEAD_REGEX = `(?!(${this.SPACE_REGEX}[-/•]|\\d))`;
  private static readonly RANGE_CONCENTRATION_REGEX = `(${this.ORDER_OPERATORS_REGEX}|${this.NEGATIVE_LOOK_BEFORE_REGEX})${this.SPACE_REGEX}${this.DECIMAL_DIGIT_REGEX}${this.SPACE_REGEX}-${this.SPACE_REGEX}${this.ORDER_OPERATORS_REGEX}${this.SPACE_REGEX}${this.DECIMAL_DIGIT_REGEX}`; // ex: >30-<60
  private static readonly RANGE_PERCENT_CONCENTRATION_REGEX = `(${this.ORDER_OPERATORS_REGEX}|${this.NEGATIVE_LOOK_BEFORE_REGEX})${this.SPACE_REGEX}${this.DECIMAL_DIGIT_REGEX}${this.SPACE_REGEX}-${this.SPACE_REGEX}${this.ORDER_OPERATORS_REGEX}?${this.SPACE_REGEX}${this.DECIMAL_DIGIT_REGEX}(%|${this.NEGATIVE_LOOK_AHEAD_REGEX})`; // ex: 50-100%
  private static readonly IN_BETWEEN_RANGE_CONCENTRATION_REGEX = `${this.DECIMAL_DIGIT_REGEX}${this.SPACE_REGEX}${this.ORDER_OPERATORS_REGEX}[a-zA-Z\\s%]+${this.ORDER_OPERATORS_REGEX}${this.SPACE_REGEX}${this.DECIMAL_DIGIT_REGEX}`; // ex: 30 < x% <= 20
  private static readonly PERCENT_CONCENTRATION_REGEX = `${this.ORDER_OPERATORS_REGEX}${this.SPACE_REGEX}${this.DECIMAL_DIGIT_REGEX}${this.SPACE_REGEX}(%|${this.NEGATIVE_LOOK_AHEAD_REGEX})`; // ex: <30%

  public static readonly CONCENTRATION_REGEX = new RegExp(
    `(${this.RANGE_CONCENTRATION_REGEX}|${this.RANGE_PERCENT_CONCENTRATION_REGEX}|${this.IN_BETWEEN_RANGE_CONCENTRATION_REGEX}|${this.PERCENT_CONCENTRATION_REGEX})`,
  );

  public static getConcentration(text: string): string {
    const match = text.match(this.CONCENTRATION_REGEX);
    return match?.[0];
  }
}
