import type { SpyInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { IFDSTreeResult } from '@topics/engine/transformer/fds-tree-builder.model.js';
import type { IInterestingSection, IInterestingSubSection } from '@topics/engine/rules/rules.model.js';
import { SectionRulesService } from '@topics/engine/rules/section-rules.service.js';
import { FDSTreeBuilderService } from '@topics/engine/transformer/fds-tree-builder.service.js';
import {
  aLineWithOneText,
  aLineWithOneTextAndPositionYIncremented,
  aLineWithOneTextAndPositionYIncrementedTwice,
  aLineWithTwoTexts,
  aLineWithTwoTextsAndPositionYIncremented,
  aLineWithTwoTextsAndPositionYIncrementedTwice,
} from '@topics/engine/fixtures/line.mother.js';
import { INCREMENT_VALUE, POSITION_X, POSITION_Y, TEXT_CONTENT } from '@topics/engine/fixtures/fixtures.constants.js';

describe('FdsTreeBuilderService tests', () => {
  describe('BuildFdsTree tests', () => {
    let isAnInterestingSectionSpy: SpyInstance<[text: string, { currentSection: number }], IInterestingSection>;
    let isAnInterestingSubSectionSpy: SpyInstance<[text: string, { currentSection: number; currentSubSection: number }], IInterestingSubSection>;
    let isSwitchingSectionSpy: SpyInstance<[text: string, { currentSection: number }], boolean>;
    let isSwitchingSubSectionSpy: SpyInstance<[text: string, { currentSection: number; currentSubSection: number }], boolean>;
    let shouldAddLineInCurrentSubSectionSpy: SpyInstance<[currentSection: number, currentSubSection: number], boolean>;

    beforeEach(() => {
      isAnInterestingSectionSpy = vi.spyOn(SectionRulesService, 'isAnInterestingSection');
      isAnInterestingSubSectionSpy = vi.spyOn(SectionRulesService, 'isAnInterestingSubSection');
      isSwitchingSectionSpy = vi.spyOn(SectionRulesService, 'isSwitchingSection');
      isSwitchingSubSectionSpy = vi.spyOn(SectionRulesService, 'isSwitchingSubSection');
      shouldAddLineInCurrentSubSectionSpy = vi.spyOn(SectionRulesService, 'shouldAddLineInCurrentSubSection');
    });

    afterEach(() => {
      isAnInterestingSubSectionSpy.mockRestore();
      isAnInterestingSectionSpy.mockRestore();
      isSwitchingSectionSpy.mockRestore();
      isSwitchingSubSectionSpy.mockRestore();
      shouldAddLineInCurrentSubSectionSpy.mockRestore();
    });

    describe('BuildFdsTree tests without sections', () => {
      beforeEach(() => {
        isAnInterestingSectionSpy.mockImplementation((): IInterestingSection => ({ interestingSection: false, sectionNumber: null }));
        isAnInterestingSubSectionSpy.mockImplementation((): IInterestingSubSection => ({ interestingSubSection: false }));
        isSwitchingSectionSpy.mockImplementation((): boolean => false);
        isSwitchingSubSectionSpy.mockImplementation((): boolean => false);
        shouldAddLineInCurrentSubSectionSpy.mockImplementation((): boolean => false);
      });

      it('should return empty values when providing undefined lines', () => {
        const expected: IFDSTreeResult = { fdsTree: {}, xCounts: {}, fullText: '' };
        expect(FDSTreeBuilderService.buildFdsTree(undefined)).toEqual(expected);
      });

      it('should return empty values when providing empty lines', () => {
        const expected: IFDSTreeResult = { fdsTree: {}, xCounts: {}, fullText: '' };
        expect(FDSTreeBuilderService.buildFdsTree([])).toEqual(expected);
      });

      it('should return empty fds tree and concatenated texts when given one line with no section', () => {
        const line = aLineWithTwoTexts().properties;

        const expected: IFDSTreeResult = {
          fdsTree: {},
          xCounts: { [POSITION_X]: 1, [POSITION_X + INCREMENT_VALUE]: 1 },
          fullText: TEXT_CONTENT.repeat(2),
        };
        expect(FDSTreeBuilderService.buildFdsTree([line])).toEqual(expected);
      });

      it('should return empty fds tree and concatenated texts when given two lines with no section', () => {
        const lines = [aLineWithTwoTexts().properties, aLineWithOneTextAndPositionYIncremented().properties];

        const expected: IFDSTreeResult = {
          fdsTree: {},
          xCounts: { [POSITION_X + INCREMENT_VALUE]: 1, [POSITION_X]: 2 },
          fullText: TEXT_CONTENT.repeat(3),
        };
        expect(FDSTreeBuilderService.buildFdsTree(lines)).toEqual(expected);
      });
    });

    describe('BuildFdsTree tests with sections', () => {
      beforeEach(() => {
        isAnInterestingSectionSpy
          .mockImplementationOnce((): IInterestingSection => ({ interestingSection: true, sectionNumber: 1 }))
          .mockImplementationOnce((): IInterestingSection => ({ interestingSection: true, sectionNumber: 2 }));
        isAnInterestingSubSectionSpy.mockImplementation((): IInterestingSubSection => ({ interestingSubSection: false }));
        isSwitchingSectionSpy.mockImplementation((): boolean => false);
        isSwitchingSubSectionSpy.mockImplementation((): boolean => false);
        shouldAddLineInCurrentSubSectionSpy.mockImplementation((): boolean => false);
      });

      it('should return fds tree when given a line with one section', () => {
        const line = aLineWithTwoTexts().properties;

        const expected: IFDSTreeResult = {
          fdsTree: {
            1: {
              subsections: {},
              xPositionProportion: POSITION_X,
              yPositionProportion: POSITION_Y,
            },
          },
          xCounts: { [POSITION_X]: 1, [POSITION_X + INCREMENT_VALUE]: 1 },
          fullText: TEXT_CONTENT.repeat(2),
        };
        expect(FDSTreeBuilderService.buildFdsTree([line])).toEqual(expected);
      });

      it('should return fds tree when given lines with two sections', () => {
        const lines = [aLineWithOneText().properties, aLineWithOneTextAndPositionYIncremented().properties];

        const expected: IFDSTreeResult = {
          fdsTree: {
            1: {
              subsections: {},
              xPositionProportion: POSITION_X,
              yPositionProportion: POSITION_Y,
            },
            2: {
              subsections: {},
              xPositionProportion: POSITION_X,
              yPositionProportion: POSITION_Y + INCREMENT_VALUE,
            },
          },
          xCounts: { [POSITION_X]: 2 },
          fullText: TEXT_CONTENT.repeat(2),
        };
        expect(FDSTreeBuilderService.buildFdsTree(lines)).toEqual(expected);
      });
    });

    describe('BuildFdsTree tests with a section and subsections', () => {
      beforeEach(() => {
        isAnInterestingSectionSpy
          .mockImplementationOnce((): IInterestingSection => ({ interestingSection: true, sectionNumber: 1 }))
          .mockImplementation((): IInterestingSection => ({ interestingSection: false, sectionNumber: 1 }));
        isAnInterestingSubSectionSpy
          .mockImplementationOnce((): IInterestingSubSection => ({ interestingSubSection: true, subSectionNumber: 1 }))
          .mockImplementationOnce((): IInterestingSubSection => ({ interestingSubSection: true, subSectionNumber: 2 }));
        isSwitchingSectionSpy.mockImplementation((): boolean => false);
        isSwitchingSubSectionSpy.mockImplementation((): boolean => false);
        shouldAddLineInCurrentSubSectionSpy.mockImplementation((): boolean => false);
      });

      it('should return fds tree when given lines with a section and subsection', () => {
        const sectionLines = [aLineWithOneText().properties];
        const subSectionLines = [aLineWithTwoTextsAndPositionYIncremented().properties];

        const expected: IFDSTreeResult = {
          fdsTree: {
            1: {
              subsections: {
                1: {
                  xPositionProportion: POSITION_X,
                  yPositionProportion: POSITION_Y + INCREMENT_VALUE,
                  lines: subSectionLines,
                },
              },
              xPositionProportion: POSITION_X,
              yPositionProportion: POSITION_Y,
            },
          },
          xCounts: { [POSITION_X]: 2, [POSITION_X + INCREMENT_VALUE]: 1 },
          fullText: TEXT_CONTENT.repeat(3),
        };
        expect(FDSTreeBuilderService.buildFdsTree([...sectionLines, ...subSectionLines])).toEqual(expected);
      });

      it('should return fds tree when given lines with a section and two subsections', () => {
        const sectionLines = [aLineWithOneText().properties];
        const subSectionsLines = [aLineWithTwoTextsAndPositionYIncremented().properties, aLineWithTwoTextsAndPositionYIncrementedTwice().properties];

        const expected: IFDSTreeResult = {
          fdsTree: {
            1: {
              subsections: {
                1: {
                  xPositionProportion: POSITION_X,
                  yPositionProportion: POSITION_Y + INCREMENT_VALUE,
                  lines: [subSectionsLines[0]],
                },
                2: {
                  xPositionProportion: POSITION_X,
                  yPositionProportion: POSITION_Y + 2 * INCREMENT_VALUE,
                  lines: [subSectionsLines[1]],
                },
              },
              xPositionProportion: POSITION_X,
              yPositionProportion: POSITION_Y,
            },
          },
          xCounts: { [POSITION_X]: 3, [POSITION_X + INCREMENT_VALUE]: 1, [POSITION_X + 2 * INCREMENT_VALUE]: 1 },
          fullText: TEXT_CONTENT.repeat(5),
        };
        expect(FDSTreeBuilderService.buildFdsTree([...sectionLines, ...subSectionsLines])).toEqual(expected);
      });
    });

    describe('BuildFdsTree tests with section switching', () => {
      beforeEach(() => {
        isAnInterestingSectionSpy.mockImplementation((): IInterestingSection => ({ interestingSection: false, sectionNumber: null }));
        isAnInterestingSubSectionSpy.mockImplementation((): IInterestingSubSection => ({ interestingSubSection: false }));
        isSwitchingSectionSpy.mockImplementation((): boolean => true);
        isSwitchingSubSectionSpy.mockImplementation((): boolean => false);
        shouldAddLineInCurrentSubSectionSpy.mockImplementation((): boolean => false);
      });

      it('should return fds tree when switching section', () => {
        const lines = [aLineWithTwoTexts().properties];

        const expected: IFDSTreeResult = {
          fdsTree: {},
          xCounts: { [POSITION_X]: 1, [POSITION_X + INCREMENT_VALUE]: 1 },
          fullText: TEXT_CONTENT.repeat(2),
        };
        expect(FDSTreeBuilderService.buildFdsTree(lines)).toEqual(expected);
      });
    });

    describe('BuildFdsTree tests with subSection switching', () => {
      beforeEach(() => {
        isAnInterestingSectionSpy.mockImplementation((): IInterestingSection => ({ interestingSection: false, sectionNumber: null }));
        isAnInterestingSubSectionSpy.mockImplementation((): IInterestingSubSection => ({ interestingSubSection: false }));
        isSwitchingSectionSpy.mockImplementation((): boolean => false);
        isSwitchingSubSectionSpy.mockImplementation((): boolean => true);
        shouldAddLineInCurrentSubSectionSpy.mockImplementation((): boolean => false);
      });

      it('should return fds tree when switching subSection', () => {
        const lines = [aLineWithTwoTexts().properties];

        const expected: IFDSTreeResult = {
          fdsTree: {},
          xCounts: { [POSITION_X]: 1, [POSITION_X + INCREMENT_VALUE]: 1 },
          fullText: TEXT_CONTENT.repeat(2),
        };
        expect(FDSTreeBuilderService.buildFdsTree(lines)).toEqual(expected);
      });
    });

    describe('BuildFdsTree tests when adding line to current subSection', () => {
      beforeEach(() => {
        isAnInterestingSectionSpy
          .mockImplementationOnce((): IInterestingSection => ({ interestingSection: true, sectionNumber: 1 }))
          .mockImplementation((): IInterestingSection => ({ interestingSection: false, sectionNumber: 1 }));
        isAnInterestingSubSectionSpy
          .mockImplementationOnce((): IInterestingSubSection => ({ interestingSubSection: true, subSectionNumber: 1 }))
          .mockImplementation((): IInterestingSubSection => ({ interestingSubSection: false }));
        isSwitchingSectionSpy.mockImplementation((): boolean => false);
        isSwitchingSubSectionSpy.mockImplementation((): boolean => false);
        shouldAddLineInCurrentSubSectionSpy.mockImplementationOnce((): boolean => true);
      });

      it('should return fds tree with line added to current subSection', () => {
        const sectionLine = aLineWithOneText().properties;
        const subSectionLine = aLineWithTwoTextsAndPositionYIncremented().properties;
        const extraSubSectionLine = aLineWithOneTextAndPositionYIncrementedTwice().properties;

        const expected: IFDSTreeResult = {
          fdsTree: {
            1: {
              subsections: {
                1: {
                  xPositionProportion: POSITION_X,
                  yPositionProportion: POSITION_Y + INCREMENT_VALUE,
                  lines: [subSectionLine, extraSubSectionLine],
                },
              },
              xPositionProportion: POSITION_X,
              yPositionProportion: POSITION_Y,
            },
          },
          xCounts: { [POSITION_X]: 3, [POSITION_X + INCREMENT_VALUE]: 1 },
          fullText: TEXT_CONTENT.repeat(4),
        };
        expect(FDSTreeBuilderService.buildFdsTree([sectionLine, subSectionLine, extraSubSectionLine])).toEqual(expected);
      });
    });
  });
});
