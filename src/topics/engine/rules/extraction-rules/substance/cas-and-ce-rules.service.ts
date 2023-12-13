import _ from 'lodash';

import type { IExtractedSubstance, ILine } from '@topics/engine/model/fds.model.js';
import { CommonRegexRulesService } from '@topics/engine/rules/extraction-rules/common-regex-rules.service.js';
import { ExtractionCleanerService } from '@topics/engine/rules/extraction-cleaner.service.js';

export class CasAndCeRulesService {
  public static getSubstancesCasAndCe(linesToSearchIn: ILine[]): Array<Pick<IExtractedSubstance, 'casNumber' | 'ceNumber' | 'metaData'>> {
    const substances: IExtractedSubstance[] = [];
    let previousLineSubstance: Partial<IExtractedSubstance> = {};

    for (const line of linesToSearchIn) {
      const textCleaned = _.map(line.texts, 'content').join(' ');
      const metaData = { startBox: line.startBox, endBox: line.endBox };

      const casNumber = this.getCasNumber(textCleaned);
      const ceNumber = this.getCeNumber(textCleaned);

      const substanceDefinitionHasNotStarted = !casNumber && !ceNumber && !_.last(substances);
      if (substanceDefinitionHasNotStarted) continue;

      if (this.isSameSubstance({ casNumber, ceNumber }, previousLineSubstance)) {
        const lastSubstance = _.last(substances);
        substances[substances.length - 1] = {
          casNumber: lastSubstance?.casNumber || casNumber,
          ceNumber: lastSubstance?.ceNumber || ceNumber,
          metaData: lastSubstance?.metaData || metaData,
        };
        previousLineSubstance = {};
        continue;
      }

      substances.push({ casNumber, ceNumber, metaData });
      previousLineSubstance = { casNumber, ceNumber };
    }
    return _(substances)
      .uniqBy((substance) => `${substance.casNumber};${substance.ceNumber}`)
      .map((substance) => ({
        ...substance,
        casNumber: ExtractionCleanerService.cleanSpaces(substance.casNumber),
        ceNumber: ExtractionCleanerService.cleanSpaces(substance.ceNumber),
      }))
      .value();
  }

  private static readonly SEPARATOR_REGEX = `${CommonRegexRulesService.SPACE_REGEX}-${CommonRegexRulesService.SPACE_REGEX}`;
  private static readonly NEGATIVE_LOOK_BEHIND_REGEX = `(?<!([-/•]${CommonRegexRulesService.SPACE_REGEX}|\\d)+)`;
  private static readonly NEGATIVE_LOOK_AHEAD_REGEX = `(?!(${CommonRegexRulesService.SPACE_REGEX}[-/•]|\\d)+)`;
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
    newSubstance: { casNumber: string; ceNumber: string },
    previousLineMatch: Partial<{ casNumber: string; ceNumber: string }>,
  ): boolean {
    const newSubstanceHasBothCasAndCe = newSubstance.casNumber && newSubstance.ceNumber;
    if (newSubstanceHasBothCasAndCe) return false;

    const newSubstanceHasNoCasNorCe = !newSubstance.casNumber && !newSubstance.ceNumber;
    if (newSubstanceHasNoCasNorCe) return true;

    const previousLineMatchOnlyACasOrACe =
      (previousLineMatch?.casNumber && !previousLineMatch?.ceNumber) || (!previousLineMatch?.casNumber && previousLineMatch?.ceNumber);
    if (!previousLineMatchOnlyACasOrACe) return false;

    const newSubstanceDefinesFieldThatPreviousLineDoesNot =
      newSubstance.casNumber !== previousLineMatch?.casNumber && newSubstance.ceNumber !== previousLineMatch?.ceNumber;
    if (newSubstanceDefinesFieldThatPreviousLineDoesNot) return true;

    return false;
  }
}
