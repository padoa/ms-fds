import type { SpyInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SectionRulesService } from '@topics/engine/rules/section-rules.service.js';
import { FdsTreeBuilderService } from '@topics/engine/transformer/fds-tree-builder.service.js';
import {
  aLineWithOneText,
  aLineWithOneTextAndPositionYIncremented,
  aLineWithOneTextAndPositionYIncrementedTwice,
  aLineWithTwoTexts,
  aLineWithTwoTextsAndPositionYIncremented,
  aLineWithTwoTextsAndPositionYIncrementedTwice,
} from '@topics/engine/__fixtures__/line.mother.js';
import { INCREMENT_VALUE, POSITION_PROPORTION_X, TEXT_CONTENT } from '@topics/engine/__fixtures__/fixtures.constants.js';
import type { IFdsTree, IStroke } from '@topics/engine/model/fds.model.js';
import { aFdsTree, anEmptyFdsTreeWithAllSections } from '@topics/engine/__fixtures__/fds-tree.mother.js';
import { aStroke } from '@topics/engine/__fixtures__/stroke.mother.js';
import { aSection } from '@topics/engine/__fixtures__/section.mother.js';
import { aSubSection } from '@topics/engine/__fixtures__/sub-section.mother.js';
import { aPosition } from '@topics/engine/__fixtures__/position.mother.js';

describe('FdsTreeBuilderService tests', () => {
  describe('BuildFdsTreeWithoutStrokes tests', () => {
    let isAnInterestingSectionSpy: SpyInstance<[section: number], boolean>;
    let isAnInterestingSubSectionSpy: SpyInstance<[section: number, subSection: number], boolean>;
    let computeNewSectionSpy: SpyInstance<[text: string, { currentSection: number }], number>;
    let computeNewSubSectionSpy: SpyInstance<[text: string, { currentSection: number; currentSubSection: number }], number>;

    beforeEach(() => {
      isAnInterestingSectionSpy = vi.spyOn(SectionRulesService, 'isAnInterestingSection');
      isAnInterestingSubSectionSpy = vi.spyOn(SectionRulesService, 'isAnInterestingSubSection');
      computeNewSectionSpy = vi.spyOn(SectionRulesService, 'computeNewSection');
      computeNewSubSectionSpy = vi.spyOn(SectionRulesService, 'computeNewSubSection');
    });

    afterEach(() => {
      isAnInterestingSubSectionSpy.mockRestore();
      isAnInterestingSectionSpy.mockRestore();
      computeNewSectionSpy.mockRestore();
      computeNewSubSectionSpy.mockRestore();
    });

    describe('BuildFdsTreeWithoutStrokes tests without sections', () => {
      beforeEach(() => {
        isAnInterestingSectionSpy.mockImplementation(() => false);
        isAnInterestingSubSectionSpy.mockImplementation(() => false);
        computeNewSectionSpy.mockImplementation((text, { currentSection }) => currentSection);
        computeNewSubSectionSpy.mockImplementation((text, { currentSubSection }) => currentSubSection);
      });

      it('should return empty values when providing undefined lines', () => {
        const expected = { fdsTree: {}, xCounts: {}, fullText: '' };
        expect(FdsTreeBuilderService.buildFdsTreeWithoutStrokes(undefined)).toEqual(expected);
      });

      it('should return empty values when providing empty lines', () => {
        const expected = { fdsTree: {}, xCounts: {}, fullText: '' };
        expect(FdsTreeBuilderService.buildFdsTreeWithoutStrokes([])).toEqual(expected);
      });

      it('should return empty fds tree and concatenated texts when given one line with no section', () => {
        const line = aLineWithTwoTexts().properties;

        const expected = {
          fdsTree: {},
          xCounts: { [POSITION_PROPORTION_X]: 1, [POSITION_PROPORTION_X + INCREMENT_VALUE]: 1 },
          fullText: TEXT_CONTENT.repeat(2),
        };
        expect(FdsTreeBuilderService.buildFdsTreeWithoutStrokes([line])).toEqual(expected);
      });

      it('should return empty fds tree and concatenated texts when given two lines with no section', () => {
        const lines = [aLineWithTwoTexts().properties, aLineWithOneTextAndPositionYIncremented().properties];

        const expected = {
          fdsTree: {},
          xCounts: { [POSITION_PROPORTION_X + INCREMENT_VALUE]: 1, [POSITION_PROPORTION_X]: 2 },
          fullText: TEXT_CONTENT.repeat(3),
        };
        expect(FdsTreeBuilderService.buildFdsTreeWithoutStrokes(lines)).toEqual(expected);
      });
    });

    describe('BuildFdsTreeWithoutStrokes tests with sections', () => {
      beforeEach(() => {
        isAnInterestingSectionSpy.mockImplementation(() => true);
        isAnInterestingSubSectionSpy.mockImplementation(() => false);
        computeNewSectionSpy.mockImplementationOnce(() => 1).mockImplementation(() => 2);
        computeNewSubSectionSpy.mockImplementation((text, { currentSubSection }) => currentSubSection);
      });

      it('should return fds tree when given a line with one section', () => {
        const line = aLineWithTwoTexts().properties;

        const expected = {
          fdsTree: {
            1: {
              subsections: {},
              startBox: line.startBox,
            },
          },
          xCounts: { [POSITION_PROPORTION_X]: 1, [POSITION_PROPORTION_X + INCREMENT_VALUE]: 1 },
          fullText: TEXT_CONTENT.repeat(2),
        };
        expect(FdsTreeBuilderService.buildFdsTreeWithoutStrokes([line])).toEqual(expected);
      });

      it('should return fds tree when given lines with two sections', () => {
        const lines = [aLineWithOneText().properties, aLineWithOneTextAndPositionYIncremented().properties];

        const expected = {
          fdsTree: {
            1: {
              subsections: {},
              startBox: lines[0].startBox,
              endBox: lines[1].startBox,
            },
            2: {
              subsections: {},
              startBox: lines[1].startBox,
            },
          },
          xCounts: { [POSITION_PROPORTION_X]: 2 },
          fullText: TEXT_CONTENT.repeat(2),
        };
        expect(FdsTreeBuilderService.buildFdsTreeWithoutStrokes(lines)).toEqual(expected);
      });
    });

    describe('BuildFdsTreeWithoutStrokes tests with a section and subsections', () => {
      beforeEach(() => {
        isAnInterestingSectionSpy.mockImplementationOnce(() => true).mockImplementation(() => false);
        isAnInterestingSubSectionSpy.mockImplementation(() => true);
        computeNewSectionSpy.mockImplementation(() => 1);
        computeNewSubSectionSpy.mockImplementationOnce(() => 1).mockImplementation(() => 2);
      });

      it('should return fds tree when given lines with a section and subsection', () => {
        const sectionLines = [aLineWithOneText().properties];
        const subSectionLines = [aLineWithTwoTextsAndPositionYIncremented().properties];

        const expected = {
          fdsTree: {
            1: {
              subsections: {
                1: {
                  startBox: subSectionLines[0].startBox,
                  lines: subSectionLines,
                },
              },
              startBox: sectionLines[0].startBox,
            },
          },
          xCounts: { [POSITION_PROPORTION_X]: 2, [POSITION_PROPORTION_X + INCREMENT_VALUE]: 1 },
          fullText: TEXT_CONTENT.repeat(3),
        };
        expect(FdsTreeBuilderService.buildFdsTreeWithoutStrokes([...sectionLines, ...subSectionLines])).toEqual(expected);
      });

      it('should return fds tree when given lines with a section and two subsections', () => {
        const sectionLines = [aLineWithOneText().properties];
        const subSectionsLines = [aLineWithTwoTextsAndPositionYIncremented().properties, aLineWithTwoTextsAndPositionYIncrementedTwice().properties];

        const expected = {
          fdsTree: {
            1: {
              subsections: {
                1: {
                  startBox: subSectionsLines[0].startBox,
                  endBox: subSectionsLines[1].startBox,
                  lines: [subSectionsLines[0]],
                },
                2: {
                  startBox: subSectionsLines[1].startBox,
                  lines: [subSectionsLines[1]],
                },
              },
              startBox: sectionLines[0].startBox,
            },
          },
          xCounts: { [POSITION_PROPORTION_X]: 3, [POSITION_PROPORTION_X + INCREMENT_VALUE]: 1, [POSITION_PROPORTION_X + 2 * INCREMENT_VALUE]: 1 },
          fullText: TEXT_CONTENT.repeat(5),
        };
        expect(FdsTreeBuilderService.buildFdsTreeWithoutStrokes([...sectionLines, ...subSectionsLines])).toEqual(expected);
      });
    });

    describe('BuildFdsTreeWithoutStrokes tests with uninteresting section switching', () => {
      beforeEach(() => {
        isAnInterestingSectionSpy.mockImplementation(() => false);
        isAnInterestingSubSectionSpy.mockImplementation(() => false);
        computeNewSectionSpy.mockImplementation(() => 1);
        computeNewSubSectionSpy.mockImplementation((text, { currentSubSection }) => currentSubSection);
      });

      it('should return fds tree when switching section', () => {
        const lines = [aLineWithTwoTexts().properties];

        const expected = {
          fdsTree: {},
          xCounts: { [POSITION_PROPORTION_X]: 1, [POSITION_PROPORTION_X + INCREMENT_VALUE]: 1 },
          fullText: TEXT_CONTENT.repeat(2),
        };
        expect(FdsTreeBuilderService.buildFdsTreeWithoutStrokes(lines)).toEqual(expected);
      });
    });

    describe('BuildFdsTreeWithoutStrokes tests with uninteresting subSection switching', () => {
      beforeEach(() => {
        isAnInterestingSectionSpy.mockImplementation(() => false);
        isAnInterestingSubSectionSpy.mockImplementation(() => false);
        computeNewSectionSpy.mockImplementation((text, { currentSection }) => currentSection);
        computeNewSubSectionSpy.mockImplementation(() => 1);
      });

      it('should return fds tree when switching subSection', () => {
        const lines = [aLineWithTwoTexts().properties];

        const expected = {
          fdsTree: {},
          xCounts: { [POSITION_PROPORTION_X]: 1, [POSITION_PROPORTION_X + INCREMENT_VALUE]: 1 },
          fullText: TEXT_CONTENT.repeat(2),
        };
        expect(FdsTreeBuilderService.buildFdsTreeWithoutStrokes(lines)).toEqual(expected);
      });
    });

    describe('BuildFdsTreeWithoutStrokes tests when adding line to current subSection', () => {
      beforeEach(() => {
        isAnInterestingSectionSpy.mockImplementation(() => true);
        isAnInterestingSubSectionSpy.mockImplementation(() => true);
        computeNewSectionSpy.mockImplementation(() => 1);
        computeNewSubSectionSpy.mockImplementation(() => 1);
      });

      it('should return fds tree with line added to current subSection', () => {
        const sectionLine = aLineWithOneText().properties;
        const subSectionLine = aLineWithTwoTextsAndPositionYIncremented().properties;
        const extraSubSectionLine = aLineWithOneTextAndPositionYIncrementedTwice().properties;

        const expected = {
          fdsTree: {
            1: {
              subsections: {
                1: {
                  startBox: subSectionLine.startBox,
                  lines: [subSectionLine, extraSubSectionLine],
                },
              },
              startBox: sectionLine.startBox,
            },
          },
          xCounts: { [POSITION_PROPORTION_X]: 3, [POSITION_PROPORTION_X + INCREMENT_VALUE]: 1 },
          fullText: TEXT_CONTENT.repeat(4),
        };
        expect(FdsTreeBuilderService.buildFdsTreeWithoutStrokes([sectionLine, subSectionLine, extraSubSectionLine])).toEqual(expected);
      });
    });
  });

  describe('AddStrokesToFdsTreeInPlace tests', () => {
    it.each<{ message: string; fdsTree: IFdsTree; strokes: IStroke[]; expected: IFdsTree }>([
      {
        message: 'should return an empty fds tree if the fds tree is empty',
        fdsTree: {},
        strokes: [],
        expected: {},
      },
      {
        message: 'should return an empty fds tree if the fds tree is empty even if there are strokes',
        fdsTree: {},
        strokes: [aStroke().properties],
        expected: {},
      },
      {
        message: 'should return the given fds tree if there are no strokes',
        fdsTree: anEmptyFdsTreeWithAllSections().properties,
        strokes: [],
        expected: anEmptyFdsTreeWithAllSections().properties,
      },
      {
        message: 'should add the strokes in the correct section',
        fdsTree: aFdsTree()
          .withSection1(
            aSection().withSubsections({ 1: aSubSection().withStartBox(aPosition().properties).withEndBox(aPosition().properties).properties })
              .properties,
          )
          .withSection2(
            aSection().withSubsections({
              2: aSubSection().withStartBox(aPosition().withPageNumber(1).properties).withEndBox(aPosition().withPageNumber(2).properties).properties,
            }).properties,
          ).properties,
        strokes: [aStroke().properties],
        expected: aFdsTree()
          .withSection1(
            aSection().withSubsections({
              1: aSubSection().withStartBox(aPosition().properties).withEndBox(aPosition().properties).withStrokes([aStroke().properties]).properties,
            }).properties,
          )
          .withSection2(
            aSection().withSubsections({
              2: aSubSection().withStartBox(aPosition().withPageNumber(1).properties).withEndBox(aPosition().withPageNumber(2).properties).properties,
            }).properties,
          ).properties,
      },
      {
        message: 'should add the strokes in the correct section even if there is no end box',
        fdsTree: aFdsTree().withSection1(
          aSection().withSubsections({ 1: aSubSection().withStartBox(aPosition().properties).withEndBox(null).properties }).properties,
        ).properties,
        strokes: [aStroke().properties],
        expected: aFdsTree().withSection1(
          aSection().withSubsections({
            1: aSubSection().withStartBox(aPosition().properties).withEndBox(null).withStrokes([aStroke().properties]).properties,
          }).properties,
        ).properties,
      },
    ])('$message', ({ fdsTree, strokes, expected }) => {
      expect(FdsTreeBuilderService.addStrokesToFdsTreeInPlace(fdsTree, { strokes })).toEqual(expected);
    });
  });

  describe('BuildFdsTree tests', () => {
    let buildFdsTreeWithoutStrokesSpy: SpyInstance;
    let addStrokesToFdsTreeInPlaceSpy: SpyInstance;
    const fdsTree = aFdsTree().properties;
    const fullText = 'blabla';
    const xCounts = { [POSITION_PROPORTION_X]: 10 };

    beforeEach(() => {
      buildFdsTreeWithoutStrokesSpy = vi.spyOn(FdsTreeBuilderService, 'buildFdsTreeWithoutStrokes').mockImplementation(() => ({
        fdsTree: {},
        xCounts,
        fullText,
      }));
      addStrokesToFdsTreeInPlaceSpy = vi.spyOn(FdsTreeBuilderService, 'addStrokesToFdsTreeInPlace').mockImplementation(() => fdsTree);
    });

    afterEach(() => {
      buildFdsTreeWithoutStrokesSpy.mockRestore();
      addStrokesToFdsTreeInPlaceSpy.mockRestore();
    });

    it('should return the results of buildFdsTreeWithoutStrokes and addStrokesToFdsTreeInPlace', () => {
      expect(FdsTreeBuilderService.buildFdsTree({ lines: [], strokes: [] })).toEqual({ fdsTree, fullText, xCounts });
    });
  });
});
