import _ from 'lodash';

import type { IExtractedSubstance, ILine } from '@topics/engine/model/fds.model.js';

export class CasAndCeRulesService {
  public static getSubstancesCasAndCe(linesToSearchIn: ILine[]): Array<Pick<IExtractedSubstance, 'casNumber' | 'ceNumber'>> {
    const textInEachLine = _.map(linesToSearchIn, ({ texts }) => {
      return _.map(texts, 'content').join(' ');
    });

    const substances: IExtractedSubstance[] = [];
    let previousLineSubstance: Partial<IExtractedSubstance> = {};
    for (const text of textInEachLine) {
      const textCleaned = text;

      const casNumber = this.getCASNumber(textCleaned);
      const ceNumber = this.getCENumber(textCleaned);

      // CAS and CE
      const substanceDefinitionHasNotStarted = !casNumber && !ceNumber && !_.last(substances);
      if (substanceDefinitionHasNotStarted) continue;

      if (this.isSameSubstance({ casNumber, ceNumber }, previousLineSubstance)) {
        const lastSubstance = _.last(substances);
        substances[(substances.length || 1) - 1] = {
          casNumber: lastSubstance?.casNumber || casNumber,
          ceNumber: lastSubstance?.ceNumber || ceNumber,
        };
        previousLineSubstance = {};
        continue;
      }

      substances.push({ casNumber, ceNumber });
      previousLineSubstance = { casNumber, ceNumber };
    }
    return _.uniqBy(substances, (substance) => `${substance.casNumber};${substance.ceNumber}`);
  }

  private static readonly SPACE_REGEX = '\\s*';
  public static readonly CAS_NUMBER_REGEX = new RegExp(
    `(?<!([-/•]${this.SPACE_REGEX}|\\d)+)(\\d{1,7}${this.SPACE_REGEX}-${this.SPACE_REGEX}\\d{2}${this.SPACE_REGEX}-${this.SPACE_REGEX}\\d{1})(?!(${this.SPACE_REGEX}[-/•]|\\d)+)`,
  );

  public static getCASNumber(text: string): string {
    // TODO: rule with cas
    const match = text.match(this.CAS_NUMBER_REGEX);
    return match?.[2];
  }

  public static readonly CE_NUMBER_REGEX = new RegExp(
    `(?<!([-/•]${this.SPACE_REGEX}|\\d)+)(\\d{3}${this.SPACE_REGEX}-${this.SPACE_REGEX}\\d{3}${this.SPACE_REGEX}-${this.SPACE_REGEX}\\d{1})(?!(${this.SPACE_REGEX}[-/•]|\\d)+)`,
  );

  public static getCENumber(text: string): string {
    // TODO: rule with ce
    const match = text.match(this.CE_NUMBER_REGEX);
    return match?.[2];
  }

  private static isSameSubstance(
    newSubstance: { casNumber: string; ceNumber: string },
    previousLineMatch: Partial<{ casNumber: string; ceNumber: string }>,
  ): boolean {
    const newSubstanceHasBothCasAndCe = newSubstance.casNumber && newSubstance.ceNumber;
    if (newSubstanceHasBothCasAndCe) return false;

    const newSubstanceHasNoCasNorCe = !newSubstance.casNumber && !newSubstance.ceNumber;
    if (newSubstanceHasNoCasNorCe) return true;

    const previousLineMatchOnlyACasOrACe = _.xor(previousLineMatch?.casNumber, previousLineMatch?.ceNumber);
    if (!previousLineMatchOnlyACasOrACe) return false;

    const newSubstanceDefinesFieldThatPreviousLineDoesNot =
      newSubstance.casNumber !== previousLineMatch?.casNumber && newSubstance.ceNumber !== previousLineMatch?.ceNumber;
    if (newSubstanceDefinesFieldThatPreviousLineDoesNot) return true;

    return false;
  }
}
