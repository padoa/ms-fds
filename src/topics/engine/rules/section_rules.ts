import _ from 'lodash';

//----------------------------------------------------------------------------------------------
//--------------------------------------- SECTIONS ---------------------------------------------
//----------------------------------------------------------------------------------------------

const REGEX_TO_MATCH_SECTION = {
  1: /(rubrique1(?!.?[0-9])|identificationdum[eé]lange|identificationdelasubstance|identificationduproduit)/g,
  2: /identificationdesdangers/g,
  3: /informationssurlescomposants/g,
} as { [key: number]: RegExp };

export const isAnInterestingSection = (
  text: string,
  { currentSection }: { currentSection: number },
): { interestingSection: boolean; sectionNumber: number } => {
  const regex = REGEX_TO_MATCH_SECTION[(currentSection || 0) + 1];

  if (!regex) return { interestingSection: false, sectionNumber: currentSection };

  const interestingSection = !!text.replaceAll(' ', '').match(regex);

  return {
    interestingSection,
    sectionNumber: (currentSection || 0) + 1,
  };
};

export const isSwitchingSection = (text: string, { currentSection }: { currentSection: number }): boolean => {
  return currentSection === 3 && _.includes(text, `premiers secours`);
};

//----------------------------------------------------------------------------------------------
//------------------------------------- SUB-SECTIONS -------------------------------------------
//----------------------------------------------------------------------------------------------

const SUB_SECTIONS_TO_CONSIDER = {
  1: {
    1: /(1(\.|,)1)|(identificateurd[eu]produit)/g,
    3: /(1(\.|,)3)|(renseignementsconcernantlefournisseur)/g,
  },
  2: {
    2: /(2(\.|,)2)|(élementsd'étiquetage)/g,
  },
  3: {
    1: /(3(\.|,)1)/g,
    2: /(3(\.|,)2)/g,
  },
} as { [section: number]: { [subsection: string]: RegExp } };

export const isAnInterestingSubSection = (
  text: string,
  { currentSection, currentSubSection }: { currentSection: number; currentSubSection: number },
): { interestingSubSection: boolean; subSectionNumber?: number } => {
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
};

export const isSwitchingSubSection = (
  text: string,
  { currentSection, currentSubSection }: { currentSection: number; currentSubSection: number },
): boolean => {
  const newSubSectionRegex = new RegExp(`(?<!${currentSection}\\. ?)${currentSection}\\. ?${currentSubSection + 1}`, 'g');
  return !!text.match(newSubSectionRegex);
};

export const shouldAddLineInCurrentSubSection = (currentSection: number, currentSubSection: number): boolean => {
  if (!currentSection || !currentSubSection) return false;
  const subSectionsToConsider = SUB_SECTIONS_TO_CONSIDER[currentSection];
  if (!subSectionsToConsider) return false;
  return _.includes(Object.keys(subSectionsToConsider), currentSubSection.toString());
};
