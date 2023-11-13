import _ from 'lodash';

import type { IFDSTree, ILine, ISubsection, IText, IXCounts } from '@src/tasks/poc/fds.model.js';

//----------------------------------------------------------------------------------------------
//---------------------------------------- BUILDER ---------------------------------------------
//----------------------------------------------------------------------------------------------

export const buildFdsTree = (
  lines: ILine[],
): {
  fdsTree: IFDSTree;
  xCounts: IXCounts;
  fullText: string;
} => {
  return _.reduce(
    lines,
    (
      {
        fdsTree,
        currentSection,
        currentSubSection,
        xCounts: XCountsBeforeUpdate,
        fullText: fullTextBeforeUpdate,
      }: {
        fdsTree: IFDSTree;
        currentSection: number;
        currentSubSection: number;
        xCounts: IXCounts;
        fullText: string;
      },
      line,
    ) => {
      const xCounts = updateXCounts(XCountsBeforeUpdate, line);
      const fullTextLine = line.texts.map((t) => t.content).join('');
      const fullText = `${fullTextBeforeUpdate}${fullTextLine}`;

      // console.log(fullTextLine);

      const { interestingSection, sectionNumber: newSection } = isAnInterestingSection(fullTextLine, { currentSection });
      if (interestingSection) {
        return {
          fdsTree: addFDSTreeSection(fdsTree, { line, sectionNumber: newSection }),
          currentSection: newSection,
          currentSubSection: 0,
          xCounts,
          fullText,
        };
      }

      const { interestingSubSection, subSectionNumber: newSubSection } = isAnInterestingSubSection(fullTextLine, {
        currentSection,
        currentSubSection,
      });
      if (interestingSubSection) {
        return {
          fdsTree: addFDSTreeSubSection(fdsTree, {
            line,
            sectionNumber: currentSection,
            subSectionNumber: newSubSection,
          }),
          currentSection,
          currentSubSection: newSubSection,
          xCounts,
          fullText,
        };
      }

      if (isSwitchingSection(fullTextLine, { currentSection })) {
        return { fdsTree, currentSection: currentSection + 1, currentSubSection: null, xCounts, fullText };
      }

      if (isSwitchingSubSection(fullTextLine, { currentSection, currentSubSection })) {
        return { fdsTree, currentSection, currentSubSection: currentSubSection + 1, xCounts, fullText };
      }

      if (shouldAddLine(currentSection, currentSubSection)) {
        return {
          fdsTree: addFdsTreeLine(fdsTree, {
            line,
            sectionNumber: currentSection,
            subSectionNumber: currentSubSection,
          }),
          currentSection,
          currentSubSection,
          xCounts,
          fullText,
        };
      }

      return { fdsTree, currentSection, currentSubSection, xCounts, fullText };
    },
    { fdsTree: {}, currentSection: null, currentSubSection: null, xCounts: {}, fullText: '', currentLine: null } as {
      fdsTree: IFDSTree;
      currentSection: number;
      currentSubSection: number;
      xCounts: IXCounts;
      fullText: string;
    },
  );
};

//----------------------------------------------------------------------------------------------
//--------------------------------------- BUILDERS ---------------------------------------------
//----------------------------------------------------------------------------------------------

const addFDSTreeSection = (fdsTree: IFDSTree, { line, sectionNumber }: { line: ILine; sectionNumber: number }): IFDSTree => {
  return { ...fdsTree, [sectionNumber]: { x: line.x, y: line.y, subsections: {} as ISubsection } };
};

const addFDSTreeSubSection = (
  fdsTree: IFDSTree,
  { line, sectionNumber, subSectionNumber }: { line: ILine; sectionNumber: number; subSectionNumber: number },
): IFDSTree => {
  return {
    ...fdsTree,
    [sectionNumber]: {
      ...fdsTree[sectionNumber],
      subsections: {
        ...fdsTree[sectionNumber].subsections,
        [subSectionNumber]: {
          x: line.x,
          y: line.y,
          lines: [line],
        },
      },
    },
  };
};

const addFdsTreeLine = (
  fdsTree: IFDSTree,
  { line, sectionNumber, subSectionNumber }: { line: ILine; sectionNumber: number; subSectionNumber: number },
): IFDSTree => {
  const { lines } = fdsTree[sectionNumber].subsections[subSectionNumber];

  return {
    ...fdsTree,
    [sectionNumber]: {
      ...fdsTree[sectionNumber],
      subsections: {
        ...fdsTree[sectionNumber].subsections,
        [subSectionNumber]: {
          ...fdsTree[sectionNumber].subsections[subSectionNumber],
          lines: [...lines, line],
        },
      },
    },
  };
};

const updateXCounts = (xCounts: IXCounts, line: ILine): IXCounts => {
  return _.reduce(
    line.texts,
    (xCountsAcc, textElement) => {
      return updateXCountElement(xCountsAcc, textElement);
    },
    xCounts,
  );
};

const updateXCountElement = (xCounts: IXCounts, textElement: IText): IXCounts => {
  const actualCount = xCounts[textElement.x] || 0;
  return {
    ...xCounts,
    [textElement.x]: actualCount + 1,
  };
};

//----------------------------------------------------------------------------------------------
//-------------------------------------- CONDITIONS --------------------------------------------
//----------------------------------------------------------------------------------------------

const REGEX_TO_MATCH_SECTION = {
  1: /(rubrique1(?!.?[0-9])|identificationdum[eé]lange|identificationdelasubstance|identificationduproduit)/g,
  2: /identificationdesdangers/g,
  3: /informationssurlescomposants/g,
} as { [key: number]: RegExp };

const isAnInterestingSection = (
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

const isAnInterestingSubSection = (
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

const isSwitchingSection = (text: string, { currentSection }: { currentSection: number }): boolean => {
  return currentSection === 3 && _.includes(text, `premiers secours`);
};

const isSwitchingSubSection = (
  text: string,
  { currentSection, currentSubSection }: { currentSection: number; currentSubSection: number },
): boolean => {
  const newSubSectionRegex = new RegExp(`(?<!${currentSection}\\. ?)${currentSection}\\. ?${currentSubSection + 1}`, 'g');
  return !!text.match(newSubSectionRegex);
};

const shouldAddLine = (currentSection: number, currentSubSection: number): boolean => {
  if (!currentSection || !currentSubSection) return false;
  const subSectionsToConsider = SUB_SECTIONS_TO_CONSIDER[currentSection];
  if (!subSectionsToConsider) return false;
  return _.includes(Object.keys(subSectionsToConsider), currentSubSection.toString());
};
