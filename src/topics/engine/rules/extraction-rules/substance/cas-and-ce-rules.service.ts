import _ from 'lodash';

import type { IExtractedCasNumber, IExtractedCeNumber, IExtractedSubstance, ILine } from '@topics/engine/model/fds.model.js';
import { CommonRegexRulesService } from '@topics/engine/rules/extraction-rules/common-regex-rules.service.js';
import { ExtractionCleanerService } from '@topics/engine/rules/extraction-cleaner.service.js';

export class CasAndCeRulesService {
  public static getSubstancesCasAndCe(linesToSearchIn: ILine[]): Array<Pick<IExtractedSubstance, 'casNumber' | 'ceNumber'>> {
    const substances: IExtractedSubstance[] = [];
    let previousLineSubstance: Partial<IExtractedSubstance> = {};

    for (const line of linesToSearchIn) {
      const textCleaned = _.map(line.texts, 'content').join(' ');
      const metaData = { startBox: line.startBox, endBox: line.endBox };

      const casNumberValue = this.getCasNumber(textCleaned);
      const ceNumberValue = this.getCeNumber(textCleaned);

      const casNumber = casNumberValue ? { value: ExtractionCleanerService.cleanSpaces(casNumberValue), metaData } : undefined;
      const ceNumber = ceNumberValue ? { value: ExtractionCleanerService.cleanSpaces(ceNumberValue), metaData } : undefined;

      const substanceDefinitionHasNotStarted = !casNumber && !ceNumber && !_.last(substances);
      if (substanceDefinitionHasNotStarted) continue;

      if (this.isSameSubstance({ casNumber, ceNumber }, previousLineSubstance)) {
        const lastSubstance = _.last(substances);
        substances[substances.length - 1] = {
          casNumber: lastSubstance?.casNumber || casNumber,
          ceNumber: lastSubstance?.ceNumber || ceNumber,
        };
        previousLineSubstance = {};
        continue;
      }

      substances.push({ casNumber, ceNumber });
      previousLineSubstance = { casNumber, ceNumber };
    }
    return _(substances)
      .uniqBy((substance) => `${substance.casNumber?.value};${substance.ceNumber?.value}`)
      .value();
  }

  private static readonly SEPARATOR_REGEX = `${CommonRegexRulesService.SPACE_REGEX}-${CommonRegexRulesService.SPACE_REGEX}`;
  private static readonly NEGATIVE_LOOK_BEHIND_REGEX = `(?<!(-|\\d)+)`;
  private static readonly NEGATIVE_LOOK_AHEAD_REGEX = `(?!(-|\\d)+)`;
  public static readonly CAS_NUMBER_REGEX = new RegExp(
    `${this.NEGATIVE_LOOK_BEHIND_REGEX}(\\d{1,7}${this.SEPARATOR_REGEX}\\d{2}${this.SEPARATOR_REGEX}\\d{1})${this.NEGATIVE_LOOK_AHEAD_REGEX}`,
  );

  public static getCasNumber(text: string): string {
    // TODO: rule with cas
    const match = text.match(this.CAS_NUMBER_REGEX);
    return match?.[2];
  }

  public static readonly CE_NUMBER_REGEX = new RegExp(
    `${this.NEGATIVE_LOOK_BEHIND_REGEX}(\\d{3}${this.SEPARATOR_REGEX}\\d{3}${this.SEPARATOR_REGEX}\\d{1})${this.NEGATIVE_LOOK_AHEAD_REGEX}`,
  );

  public static getCeNumber(text: string): string {
    // TODO: rule with ce
    const match = text.match(this.CE_NUMBER_REGEX);
    return match?.[2];
  }

  private static isSameSubstance(
    newSubstance: { casNumber: IExtractedCasNumber; ceNumber: IExtractedCeNumber },
    previousLineMatch: Partial<IExtractedSubstance>,
  ): boolean {
    const newSubstanceHasBothCasAndCe = newSubstance.casNumber?.value && newSubstance.ceNumber?.value;
    if (newSubstanceHasBothCasAndCe) return false;

    const newSubstanceHasNoCasNorCe = !newSubstance.casNumber?.value && !newSubstance.ceNumber?.value;
    if (newSubstanceHasNoCasNorCe) return true;

    const previousLineMatchOnlyACasOrACe =
      (previousLineMatch.casNumber?.value && !previousLineMatch.ceNumber?.value) ||
      (!previousLineMatch.casNumber?.value && previousLineMatch.ceNumber?.value);
    if (!previousLineMatchOnlyACasOrACe) return false;

    const newSubstanceDefinesFieldThatPreviousLineDoesNot =
      newSubstance.casNumber?.value !== previousLineMatch.casNumber?.value && newSubstance.ceNumber?.value !== previousLineMatch.ceNumber?.value;
    if (newSubstanceDefinesFieldThatPreviousLineDoesNot) return true;

    return false;
  }
}
