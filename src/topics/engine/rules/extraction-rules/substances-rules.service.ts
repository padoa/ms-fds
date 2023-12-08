import _ from 'lodash';

import type { IFdsTree, IExtractedSubstance } from '@topics/engine/model/fds.model.js';

export class SubstancesRulesService {
  private static readonly separatorRegex = '\\s*-\\s*';

  public static readonly CASNumberRegex = `(?<!(-|\\d{1})+)(\\d{1,7}${this.separatorRegex}\\d{2}${this.separatorRegex}\\d{1})(?!(-|\\d{1})+)`;
  public static readonly CENumberRegex = `(?<!(\\d{1})+)(\\d{3}${this.separatorRegex}\\d{3}${this.separatorRegex}\\d{1})(?!(\\d{1})+)`;

  public static getSubstances = (fdsTree: IFdsTree): IExtractedSubstance[] => {
    const linesToSearchIn = [...(fdsTree[3]?.subsections?.[1]?.lines || []), ...(fdsTree[3]?.subsections?.[2]?.lines || [])];
    const infoInEachLine = _.map(linesToSearchIn, ({ texts, startBox, endBox }) => {
      const textContent = _.map(texts, (text) => text.content).join('');
      return { text: textContent, startBox, endBox };
    });

    const substances: IExtractedSubstance[] = [];
    let previousLineSubstance: Partial<IExtractedSubstance> = {};
    for (const info of infoInEachLine) {
      const { text, startBox, endBox } = info;
      const textCleaned = text.replaceAll(' ', '');
      const metaData = { startBox, endBox };

      const casNumber = this.getCASNumber(textCleaned);
      const ceNumber = this.getCENumber(textCleaned);

      if (casNumber && ceNumber) {
        substances.push({ casNumber, ceNumber, metaData });
        previousLineSubstance = {};
        continue;
      }

      if (!casNumber && !ceNumber) {
        previousLineSubstance = {};
        continue;
      }

      const lastSubstance = _.last(substances);
      if (lastSubstance && lastSubstance.casNumber === previousLineSubstance.casNumber && lastSubstance.ceNumber === previousLineSubstance.ceNumber) {
        substances[substances.length - 1] = {
          casNumber: lastSubstance.casNumber || casNumber,
          ceNumber: lastSubstance.ceNumber || ceNumber,
          metaData,
        };
        previousLineSubstance = {};
        continue;
      }

      previousLineSubstance = { casNumber, ceNumber };
      substances.push({ casNumber, ceNumber, metaData });
    }

    return substances;
  };

  private static getCASNumber = (text: string): string => {
    // TODO: rule with cas
    const match = text.match(this.CASNumberRegex);
    return match?.[2];
  };

  private static getCENumber = (text: string): string => {
    // TODO: rule with ce
    const match = text.match(this.CENumberRegex);
    return match?.[2];
  };
}
