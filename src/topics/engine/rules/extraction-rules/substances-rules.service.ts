import _ from 'lodash';

import type { IFdsTree, IExtractedSubstance } from '@topics/engine/model/fds.model.js';

export class SubstancesRulesService {
  public static readonly CASNumberRegex = /(?<!(-|\d{1})+)(\d{1,7}-\d{2}-\d{1})(?!(-|\d{1})+)/;
  public static readonly CENumberRegex = /(?<!(\d{1})+)(\d{3}-\d{3}-\d{1})(?!(\d{1})+)/;

  public static getSubstances = (fdsTree: IFdsTree): IExtractedSubstance[] => {
    const linesToSearchIn = [...(fdsTree[3]?.subsections?.[1]?.lines || []), ...(fdsTree[3]?.subsections?.[2]?.lines || [])];
    const textInEachLine = _.map(linesToSearchIn, ({ texts }) => {
      return _.map(texts, 'content').join('');
    });

    const substances: IExtractedSubstance[] = [];
    let previousLineSubstance: Partial<IExtractedSubstance> = {};
    for (const text of textInEachLine) {
      const textCleaned = text.replaceAll(' ', '');

      const casNumber = this.getCASNumber(textCleaned);
      const ceNumber = this.getCENumber(textCleaned);

      if (casNumber && ceNumber) {
        substances.push({ casNumber, ceNumber });
        previousLineSubstance = {};
        continue;
      }

      if (!casNumber && !ceNumber) {
        previousLineSubstance = {};
        continue;
      }

      const lastSubstance = _.last(substances);
      if (lastSubstance && lastSubstance.casNumber === previousLineSubstance.casNumber && lastSubstance.ceNumber === previousLineSubstance.ceNumber) {
        substances[substances.length - 1] = { casNumber: lastSubstance.casNumber || casNumber, ceNumber: lastSubstance.ceNumber || ceNumber };
        previousLineSubstance = {};
        continue;
      }

      previousLineSubstance = { casNumber, ceNumber };
      substances.push({ casNumber, ceNumber });
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
