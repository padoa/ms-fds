import _ from 'lodash';

import type { IExtractedBoilingPoint, IFdsTree, ILine } from '@topics/engine/model/fds.model.js';
import { CommonRegexRulesService } from '@topics/engine/rules/extraction-rules/common-regex-rules.service.js';

export class BoilingPointRulesService {
  public static readonly BOILING_POINT_IDENTIFIER_REGEX = `[eé]bullition`;
  public static readonly BOILING_POINT_VALUE_REGEX = `(${CommonRegexRulesService.ORDER_OPERATORS_REGEX}${CommonRegexRulesService.SPACE_REGEX})?${CommonRegexRulesService.NUMBER_WITH_OPTIONAL_DECIMAL_REGEX}(-${CommonRegexRulesService.SPACE_REGEX}${CommonRegexRulesService.NUMBER_WITH_OPTIONAL_DECIMAL_REGEX})?${CommonRegexRulesService.TEMPERATURE_UNITS_REGEX}`;

  public static getBoilingPoint(fdsTree: IFdsTree): IExtractedBoilingPoint | null {
    const linesToSearchIn = fdsTree[9]?.subsections?.[1]?.lines;
    if (_.isEmpty(linesToSearchIn)) return null;

    return this.getBoilingPointByValue(linesToSearchIn);
  }

  private static getBoilingPointByValue(linesToSearchIn: ILine[]): IExtractedBoilingPoint | null {
    for (const line of linesToSearchIn) {
      const { texts, startBox, endBox } = line;

      const lineText = texts.map(({ content }) => content).join('');
      const boilingPointInLine = !!lineText.match(this.BOILING_POINT_IDENTIFIER_REGEX);
      if (!boilingPointInLine) continue;

      const boilingPoint = lineText.match(this.BOILING_POINT_VALUE_REGEX) || [];

      // TODO: handle "non applicable, non disponible" in order to return null and cancel loop
      if (_.isEmpty(boilingPoint)) continue;

      return { value: _.first(boilingPoint), metaData: { startBox, endBox } };
    }

    return null;
  }
}
