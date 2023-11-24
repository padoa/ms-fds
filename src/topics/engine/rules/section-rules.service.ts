import _ from 'lodash';

import { REGEX_TO_MATCH_SECTION, SUB_SECTIONS_TO_CONSIDER } from '@topics/engine/rules/rules.constants.js';
import type { IInterestingSection, IInterestingSubSection } from '@topics/engine/rules/rules.model.js';

export class SectionRulesService {
  public static isAnInterestingSection(text: string, { currentSection }: { currentSection: number }): IInterestingSection {
    const regex = REGEX_TO_MATCH_SECTION[(currentSection || 0) + 1];

    if (!regex) return { interestingSection: false, sectionNumber: currentSection };

    const interestingSection = !!text.replaceAll(' ', '').match(regex);

    return {
      interestingSection,
      sectionNumber: (currentSection || 0) + 1,
    };
  }

  public static isAnInterestingSubSection(
    text: string,
    { currentSection, currentSubSection }: { currentSection: number; currentSubSection: number },
  ): IInterestingSubSection {
    if (!currentSection) return { interestingSubSection: false };

    const subSectionsToConsider = SUB_SECTIONS_TO_CONSIDER[currentSection];

    if (!subSectionsToConsider) return { interestingSubSection: false };

    for (const subSection of Object.keys(subSectionsToConsider)) {
      const subSectionNumber = Number(subSection);

      if (subSectionNumber <= currentSubSection) continue;

      const textMatchesSubSection = !!text.replaceAll(' ', '').match(subSectionsToConsider[subSection])?.length;
      if (textMatchesSubSection) return { interestingSubSection: true, subSectionNumber };
    }

    return { interestingSubSection: false };
  }

  public static isSwitchingSubSection(
    text: string,
    { currentSection, currentSubSection }: { currentSection: number; currentSubSection: number },
  ): boolean {
    const newSubSectionRegex = new RegExp(`(?<!${currentSection}\\. ?)${currentSection}\\. ?${currentSubSection + 1}`, 'g');
    return !!text.match(newSubSectionRegex);
  }

  public static shouldAddLineInCurrentSubSection(currentSection: number, currentSubSection: number): boolean {
    if (!currentSection || !currentSubSection) return false;
    const subSectionsToConsider = SUB_SECTIONS_TO_CONSIDER[currentSection];
    if (!subSectionsToConsider) return false;
    return _.includes(Object.keys(subSectionsToConsider), currentSubSection.toString());
  }

  public static isSwitchingSection(text: string, { currentSection }: { currentSection: number }): boolean {
    return currentSection === 3 && _.includes(text, `premiers secours`);
  }
}
