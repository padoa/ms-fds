import _ from 'lodash';
import type { IExtractedBoilingPoint } from '@padoa/chemical-risk';

import type { IFdsTree, ILine } from '@topics/engine/model/fds.model.js';
import { CommonRegexRulesService } from '@topics/engine/rules/extraction-rules/common-regex-rules.service.js';
import { ExtractionToolsService } from '@topics/engine/rules/extraction-rules/extraction-tools.service.js';

export class BoilingPointRulesService {
  private static readonly OPTIONAL_NEGATIVE_NUMBER_WITH_OPTIONAL_DECIMAL_REGEX = `(-${CommonRegexRulesService.SPACE_REGEX})?\\d+${CommonRegexRulesService.SPACE_REGEX}((\\.|,)${CommonRegexRulesService.SPACE_REGEX}\\d+${CommonRegexRulesService.SPACE_REGEX})?`;

  public static readonly BOILING_POINT_IDENTIFIER_REGEX = `[eé]bullition`;
  public static readonly BOILING_POINT_VALUE_REGEX = `(${CommonRegexRulesService.ORDER_OPERATORS_REGEX}${CommonRegexRulesService.SPACE_REGEX})?${this.OPTIONAL_NEGATIVE_NUMBER_WITH_OPTIONAL_DECIMAL_REGEX}(-${CommonRegexRulesService.SPACE_REGEX}${this.OPTIONAL_NEGATIVE_NUMBER_WITH_OPTIONAL_DECIMAL_REGEX})?${CommonRegexRulesService.TEMPERATURE_UNITS_REGEX}`;

  public static getBoilingPoint(fdsTree: IFdsTree): IExtractedBoilingPoint | null {
    const linesToSearchIn = fdsTree[9]?.subsections?.[1]?.lines;
    if (_.isEmpty(linesToSearchIn)) return null;

    return this.getBoilingPointByValue(linesToSearchIn);
  }

  private static getBoilingPointByValue(linesToSearchIn: ILine[]): IExtractedBoilingPoint | null {
    const boilingPointRegex = new RegExp(this.BOILING_POINT_VALUE_REGEX);

    for (const line of linesToSearchIn) {
      const { texts, startBox, endBox } = line;

      const { cleanLineText, rawLineText } = texts.reduce(
        (joinedTexts, { cleanContent, rawContent }) => ({
          cleanLineText: joinedTexts.cleanLineText + cleanContent,
          rawLineText: joinedTexts.rawLineText + rawContent,
        }),
        { cleanLineText: '', rawLineText: '' },
      );

      const boilingPointInLine = !!cleanLineText.match(this.BOILING_POINT_IDENTIFIER_REGEX);
      if (!boilingPointInLine) continue;

      // TODO: handle "non applicable, non disponible" in order to return null and cancel loop
      const boilingPoint = ExtractionToolsService.getTextMatchingRegExp({
        rawText: rawLineText,
        cleanText: cleanLineText,
        regExp: boilingPointRegex,
      });
      if (!boilingPoint) continue;

      return { value: boilingPoint.rawText, metaData: { startBox, endBox } };
    }

    return null;
  }
}
