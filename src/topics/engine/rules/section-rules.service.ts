import _ from 'lodash';

import { SECTIONS_REGEX, SUB_SECTIONS_REGEX } from '@topics/engine/rules/rules.constants.js';

export class SectionRulesService {
  public static isAnInterestingSection(section: number): boolean {
    return !!section && !!SUB_SECTIONS_REGEX[section];
  }

  public static isAnInterestingSubSection(section: number, subSection: number): boolean {
    return !!section && !!subSection && _.some(SUB_SECTIONS_REGEX[section], ({ subSectionNumber }) => subSectionNumber === subSection);
  }

  public static computeNewSection(text: string, { currentSection }: { currentSection: number }): number {
    const regex = SECTIONS_REGEX[(currentSection || 0) + 1];

    if (!regex) return currentSection;

    const textMatchRegex = !!text?.replaceAll(' ', '').match(regex);
    return textMatchRegex ? currentSection + 1 : currentSection;
  }

  // Start to check for interesting sub sections then check for the next one by incrementing one to the current sub section
  public static computeNewSubSection(
    text: string,
    { currentSection, currentSubSection }: { currentSection: number; currentSubSection: number },
  ): number {
    const interestingSubSections = SUB_SECTIONS_REGEX[currentSection];
    const subSectionsToConsider = _(interestingSubSections)
      .filter(({ subSectionNumber }) => subSectionNumber > currentSubSection)
      .sortBy('subSectionNumber')
      .value();

    for (const { subSectionNumber, subSectionRegex } of subSectionsToConsider) {
      const textMatchesSubSection = !!text?.replaceAll(' ', '').match(subSectionRegex);
      if (textMatchesSubSection) return subSectionNumber;
    }

    const nextSubSectionRegex = new RegExp(`(?<!${currentSection}\\. ?)${currentSection}\\. ?${currentSubSection + 1}`, 'g');
    const textMatchesNextSubSection = !!text?.match(nextSubSectionRegex);
    return textMatchesNextSubSection ? currentSubSection + 1 : currentSubSection;
  }

  public static shouldAddLineInSubSection(section: number, subSection: number): boolean {
    return SectionRulesService.isAnInterestingSubSection(section, subSection);
  }
}
