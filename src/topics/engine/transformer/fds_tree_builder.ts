import _ from 'lodash';

import type { IFDSTree, ILine, ISubsection, IText, IXCounts } from '@topics/engine/model/fds.model.js';
import {
  isAnInterestingSection,
  isAnInterestingSubSection,
  isSwitchingSection,
  isSwitchingSubSection,
  shouldAddLineInCurrentSubSection,
} from '@topics/engine/rules/section_rules.js';

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

      if (shouldAddLineInCurrentSubSection(currentSection, currentSubSection)) {
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
