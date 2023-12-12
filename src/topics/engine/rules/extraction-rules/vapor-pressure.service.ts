import _ from 'lodash';

import type { IFdsTree, IExtractedVaporPressure, ILine } from '@topics/engine/model/fds.model.js';
import { CommonRegexRulesService } from '@topics/engine/rules/extraction-rules/common-regex-rules.service.js';

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
    for (const line of linesToSearchIn) {
      const { texts, startBox, endBox } = line;

      const lineText = texts.map(({ content }) => content).join('');
      const vaporPressureInLine = !!lineText.match(this.VAPOR_PRESSURE_IDENTIFIER_REGEX);
      if (!vaporPressureInLine) continue;

      const pressure = lineText.match(this.VAPOR_PRESSURE_VALUE_REGEX) || [];
      const temperature = lineText.match(this.TEMPERATURE_VALUE_REGEX) || [];

      // TODO: handle "non applicable, non disponible" in order to return null and cancel loop
      if (_.isEmpty(pressure)) continue;

      return { pressure: _.first(pressure), temperature: _.first(temperature), metaData: { startBox, endBox } };
    }

    return null;
  }
}
