import _ from 'lodash';
import type { IExtractedVaporPressure } from '@padoa/chemical-risk';

import type { IFdsTree, ILine } from '@topics/engine/model/fds.model.js';
import { CommonRegexRulesService } from '@topics/engine/rules/extraction-rules/common-regex-rules.service.js';
import { ExtractionToolsService } from '@topics/engine/rules/extraction-rules/extraction-tools.service.js';

export class VaporPressureService {
  private static readonly PRESSURE_UNITS_REGEX = '(kpa|hpa|pa|mbar|bar|atm)';
  private static readonly NUMBER_WITH_OPTIONAL_DECIMAL_REGEX = `\\d+${CommonRegexRulesService.SPACE_REGEX}((\\.|,)${CommonRegexRulesService.SPACE_REGEX}\\d+${CommonRegexRulesService.SPACE_REGEX})?`;

  public static readonly VAPOR_PRESSURE_IDENTIFIER_REGEX = `pression${CommonRegexRulesService.SPACE_REGEX}(de)?${CommonRegexRulesService.SPACE_REGEX}vapeur`;
  public static readonly VAPOR_PRESSURE_VALUE_REGEX = `(${CommonRegexRulesService.ORDER_OPERATORS_REGEX}${CommonRegexRulesService.SPACE_REGEX})?${this.NUMBER_WITH_OPTIONAL_DECIMAL_REGEX}${this.PRESSURE_UNITS_REGEX}`;
  public static readonly TEMPERATURE_VALUE_REGEX = `${this.NUMBER_WITH_OPTIONAL_DECIMAL_REGEX}${CommonRegexRulesService.TEMPERATURE_UNITS_REGEX}`;

  public static getVaporPressure(fdsTree: IFdsTree): IExtractedVaporPressure | null {
    const linesToSearchIn = fdsTree[9]?.subsections?.[1]?.lines;
    if (_.isEmpty(linesToSearchIn)) return null;

    return this.getVaporPressureByValue(linesToSearchIn);
  }

  private static getVaporPressureByValue(linesToSearchIn: ILine[]): IExtractedVaporPressure | null {
    const pressureRegex = new RegExp(this.VAPOR_PRESSURE_VALUE_REGEX);
    const temperatureRegex = new RegExp(this.TEMPERATURE_VALUE_REGEX);

    for (const line of linesToSearchIn) {
      const { texts, startBox, endBox } = line;

      const { cleanLineText, rawLineText } = texts.reduce(
        (joinedTexts, { cleanContent, rawContent }) => ({
          cleanLineText: joinedTexts.cleanLineText + cleanContent,
          rawLineText: joinedTexts.rawLineText + rawContent,
        }),
        { cleanLineText: '', rawLineText: '' },
      );

      const vaporPressureInLine = !!cleanLineText.match(this.VAPOR_PRESSURE_IDENTIFIER_REGEX);
      if (!vaporPressureInLine) continue;

      // TODO: handle "non applicable, non disponible" in order to return null and cancel loop
      const pressure = ExtractionToolsService.getRawTextMatchingRegExp({ rawText: rawLineText, cleanText: cleanLineText, regExp: pressureRegex });
      if (!pressure) continue;

      const temperature = ExtractionToolsService.getRawTextMatchingRegExp({
        rawText: rawLineText,
        cleanText: cleanLineText,
        regExp: temperatureRegex,
      });
      return { pressure, temperature, metaData: { startBox, endBox } };
    }

    return null;
  }
}
