import _ from 'lodash';

import type { IConcentration, ILine, IStroke, IText } from '@topics/engine/model/fds.model.js';
import { TableExtractionService } from '@topics/engine/rules/extraction-rules/substance/table-extraction.service.js';
import { CommonRegexRulesService } from '@topics/engine/rules/extraction-rules/common-regex-rules.service.js';

export class ConcentrationRulesService {
  public static getConcentrations(linesToSearchIn: ILine[], { strokes }: { strokes: IStroke[] }): IConcentration[] {
    const tableVerticalStrokes = TableExtractionService.getTableVerticalStrokes(strokes);
    const linesSplittedByColumns = TableExtractionService.splitLinesInColumns(linesToSearchIn, tableVerticalStrokes);
    const concentrationByColumns = _.map(linesSplittedByColumns, (lines) => this.getConcentrationsInColumn(lines));
    return _.maxBy(concentrationByColumns, 'length');
  }

  public static getConcentrationsInColumn(lines: IText[][]): IConcentration[] {
    const concentrations = [];
    for (const texts of lines) {
      const text = texts.map(({ content }) => content).join(' ');
      const concentration = this.getConcentration(text);
      if (concentration) concentrations.push(concentration);
    }
    return concentrations;
  }

  private static readonly SPACE_REGEX = CommonRegexRulesService.SPACE_REGEX;
  private static readonly ORDER_OPERATORS_REGEX = CommonRegexRulesService.ORDER_OPERATORS_REGEX;
  private static readonly DECIMAL_DIGIT_REGEX = `((\\d{1,2}${this.SPACE_REGEX}[\\.,]${this.SPACE_REGEX}\\d+)|(100|\\d{1,2}))`;

  private static readonly RANGE_CONCENTRATION_REGEX = `${this.ORDER_OPERATORS_REGEX}?${this.SPACE_REGEX}${this.DECIMAL_DIGIT_REGEX}${this.SPACE_REGEX}-${this.SPACE_REGEX}${this.ORDER_OPERATORS_REGEX}${this.SPACE_REGEX}${this.DECIMAL_DIGIT_REGEX}`; // ex: >30-<60
  private static readonly RANGE_PERCENT_CONCENTRATION_REGEX = `${this.ORDER_OPERATORS_REGEX}?${this.SPACE_REGEX}${this.DECIMAL_DIGIT_REGEX}${this.SPACE_REGEX}-${this.SPACE_REGEX}${this.ORDER_OPERATORS_REGEX}?${this.SPACE_REGEX}${this.DECIMAL_DIGIT_REGEX}%?`; // ex: 50-100%
  private static readonly IN_BETWEEN_RANGE_CONCENTRATION_REGEX = `${this.DECIMAL_DIGIT_REGEX}${this.SPACE_REGEX}${this.ORDER_OPERATORS_REGEX}.+${this.ORDER_OPERATORS_REGEX}${this.SPACE_REGEX}${this.DECIMAL_DIGIT_REGEX}`; // ex: 30 < x% <= 20
  private static readonly PERCENT_CONCENTRATION_REGEX = `${this.ORDER_OPERATORS_REGEX}${this.SPACE_REGEX}${this.DECIMAL_DIGIT_REGEX}${this.SPACE_REGEX}%?`; // ex: <30%
  public static readonly CONCENTRATION_REGEX = new RegExp(
    `(?<!([-/•]${this.SPACE_REGEX}|\\d))(${this.RANGE_CONCENTRATION_REGEX}|${this.RANGE_PERCENT_CONCENTRATION_REGEX}|${this.IN_BETWEEN_RANGE_CONCENTRATION_REGEX}|${this.PERCENT_CONCENTRATION_REGEX})(?!(${this.SPACE_REGEX}[-/•]|\\d))`,
  );

  public static getConcentration(text: string): IConcentration {
    const match = text.match(this.CONCENTRATION_REGEX);
    return match?.[0];
  }
}
