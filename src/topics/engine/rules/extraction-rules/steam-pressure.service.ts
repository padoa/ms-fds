import _ from 'lodash';

import type { IFdsTree, IExtractedSteamPressure, ILine } from '@topics/engine/model/fds.model.js';

export class SteamPressureService {
  private static readonly SPACE_REGEX = '\\s*';
  private static readonly ORDER_OPERATORS_REGEX = '(<|>|<=|>=|≤|≥|supérieur[e] [à]|inférieur[e] [à])';
  private static readonly DECIMAL_REGEX = `((\\.|,)${this.SPACE_REGEX}\\d+${this.SPACE_REGEX})?`;
  private static readonly NUMBER_WITH_DECIMAL_REGEX = `\\d+${this.SPACE_REGEX}${this.DECIMAL_REGEX}`;
  private static readonly PRESSURE_UNITS_REGEX = '(kpa|hpa|pa|mbar|bar)';

  public static readonly STEAM_PRESSURE_IDENTIFIER_REGEX = `pression${this.SPACE_REGEX}(de)?${this.SPACE_REGEX}vapeur`;
  public static readonly STEAM_PRESSURE_VALUE_REGEX = `(${this.ORDER_OPERATORS_REGEX}${this.SPACE_REGEX})?${this.NUMBER_WITH_DECIMAL_REGEX}${this.PRESSURE_UNITS_REGEX}`;
  public static readonly TEMPERATURE_VALUE_REGEX = `${this.NUMBER_WITH_DECIMAL_REGEX}°${this.SPACE_REGEX}[c|k|f]`;

  public static getSteamPressure(fdsTree: IFdsTree): IExtractedSteamPressure {
    const linesToSearchIn = fdsTree[9]?.subsections?.[1]?.lines;
    if (_.isEmpty(linesToSearchIn)) return null;

    return this.getSteamPressureByValue(linesToSearchIn);
  }

  public static getSteamPressureByValue(linesToSearchIn: ILine[]): IExtractedSteamPressure {
    for (const line of linesToSearchIn) {
      const { texts, startBox, endBox } = line;

      const lineText = texts.map(({ content }) => content).join('');
      const steamPressureInLine = !!lineText.match(this.STEAM_PRESSURE_IDENTIFIER_REGEX);
      if (!steamPressureInLine) continue;

      const pressure = lineText.match(this.STEAM_PRESSURE_VALUE_REGEX) || [];
      const temperature = lineText.match(this.TEMPERATURE_VALUE_REGEX) || [];

      // TODO: handle "non applicable, non disponible" in order to return null and cancel loop
      if (_.isEmpty(pressure)) continue;

      return { pressure: _.first(pressure), temperature: _.first(temperature), metaData: { startBox, endBox } };
    }

    return null;
  }
}
