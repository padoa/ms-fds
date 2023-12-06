import type { SpyInstance } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import _ from 'lodash';

import { aFdsTree } from '@topics/engine/fixtures/fds-tree.mother.js';
import { aSectionWithPosition } from '@topics/engine/fixtures/section.mother.js';
import { aSubSectionWithPosition } from '@topics/engine/fixtures/sub-section.mother.js';
import { INCREMENT_VALUE, POSITION_X, POSITION_Y, TEXT_CONTENT } from '@topics/engine/fixtures/fixtures.constants.js';
import type { IBox, IFDSTree, ILine, IMetaData, IXCounts } from '@topics/engine/model/fds.model.js';
import {
  aLineWithOneText,
  aLineWithOneTextAndPositionYIncremented,
  aLineWithPosition,
  aLineWithTwoTexts,
} from '@topics/engine/fixtures/line.mother.js';
import {
  aTextWithContentAndPosition,
  aTextWithContentAndPositionXIncremented,
  aTextWithContentAndPositionXIncrementedTwice,
  aTextWithPosition,
} from '@topics/engine/fixtures/text.mother.js';
import { FdsTreeCleanerService } from '@topics/engine/transformer/fds-tree-cleaner.service.js';

describe('FdsTreeCleanerService Tests', () => {
  let XHighestAlignmentValueSpy: SpyInstance<[], number>;

  const iBox: IBox = { xPositionProportion: POSITION_X, yPositionProportion: POSITION_Y };
  const metaData: IMetaData = { pageNumber: 1, startBox: iBox };

  describe('CleanLine Tests', () => {
    it.each<{ message: string; line: ILine; xCounts: IXCounts; joinWithSpace: boolean; expected: ILine }>([
      {
        message: 'should return the same line if is first text',
        line: aLineWithOneText().properties,
        xCounts: { [POSITION_X]: 2 },
        joinWithSpace: false,
        expected: aLineWithOneText().properties,
      },
      {
        message: 'should return the same lines when xcount is below computedXHighestAlignmentValue',
        line: aLineWithTwoTexts().properties,
        xCounts: { [POSITION_X]: 2, [POSITION_X + INCREMENT_VALUE]: 1 },
        joinWithSpace: false,
        expected: aLineWithTwoTexts().properties,
      },
      {
        message: 'should shrink with previous text when xcount is above computedXHighestAlignmentValue',
        line: aLineWithTwoTexts().properties,
        xCounts: {
          [POSITION_X]: 2,
          [POSITION_X + INCREMENT_VALUE]: 1,
          [POSITION_X + 2 * INCREMENT_VALUE]: 1,
          [POSITION_X + 3 * INCREMENT_VALUE]: 3,
          [POSITION_X + 4 * INCREMENT_VALUE]: 3,
          [POSITION_X + 5 * INCREMENT_VALUE]: 3,
          [POSITION_X + 6 * INCREMENT_VALUE]: 3,
          [POSITION_X + 7 * INCREMENT_VALUE]: 3,
          [POSITION_X + 8 * INCREMENT_VALUE]: 3,
          [POSITION_X + 9 * INCREMENT_VALUE]: 3,
          [POSITION_X + 10 * INCREMENT_VALUE]: 3,
          [POSITION_X + 11 * INCREMENT_VALUE]: 3,
          [POSITION_X + 12 * INCREMENT_VALUE]: 3,
        },
        joinWithSpace: false,
        expected: aLineWithPosition().withTexts([aTextWithPosition().withContent(TEXT_CONTENT.repeat(2)).properties]).properties,
      },
    ])('$message', ({ line, xCounts, joinWithSpace, expected }) => {
      expect(FdsTreeCleanerService.cleanLine(line, { xCounts, joinWithSpace })).toEqual(expected);
    });
  });

  describe('CleanFDSTree tests', () => {
    const fdsTree = aFdsTree().withSection1(
      aSectionWithPosition().withSubsections({
        1: aSubSectionWithPosition().withLines([
          aLineWithPosition().withTexts([
            aTextWithContentAndPosition().properties,
            aTextWithContentAndPositionXIncremented().properties,
            aTextWithContentAndPositionXIncrementedTwice().properties,
            aTextWithContentAndPosition().properties,
          ]).properties,
        ]).properties,
      }).properties,
    ).properties;
    const xCounts = {
      [POSITION_X]: 4,
      [POSITION_X + INCREMENT_VALUE]: 1,
      [POSITION_X + 2 * INCREMENT_VALUE]: 1,
      [POSITION_X + 3 * INCREMENT_VALUE]: 1,
    };

    beforeEach(() => {
      XHighestAlignmentValueSpy = vi.spyOn(FdsTreeCleanerService, 'XHighestAlignmentValue', 'get');
      XHighestAlignmentValueSpy.mockImplementationOnce(() => 1);
    });

    it('should clean the given fds tree by concatenating texts without joining with Space', () => {
      const expected: IFDSTree = {
        1: {
          subsections: {
            1: {
              lines: [
                {
                  texts: [
                    aTextWithContentAndPosition().withContent(`${TEXT_CONTENT.repeat(3)}`).properties,
                    aTextWithContentAndPosition().properties,
                  ],
                  ...metaData,
                },
              ],
              ...iBox,
            },
          },
          ...iBox,
        },
      };

      expect(
        FdsTreeCleanerService.cleanFDSTree(fdsTree, {
          fromImage: false,
          xCounts,
        }),
      ).toEqual(expected);
    });

    it('should clean the given fds tree by concatenating texts joining with Space', () => {
      const expected: IFDSTree = {
        1: {
          subsections: {
            1: {
              lines: [
                {
                  texts: [
                    aTextWithContentAndPosition().withContent(`${_.times(3, () => TEXT_CONTENT).join(' ')}`).properties,
                    aTextWithContentAndPosition().properties,
                  ],
                  ...metaData,
                },
              ],
              ...iBox,
            },
          },
          ...iBox,
        },
      };

      expect(
        FdsTreeCleanerService.cleanFDSTree(fdsTree, {
          fromImage: true,
          xCounts,
        }),
      ).toEqual(expected);
    });

    it('should return the same subSections as given inside section3', () => {
      const fdsTreeSection3 = aFdsTree().withSection3(
        aSectionWithPosition().withSubsections({
          1: aSubSectionWithPosition().withLines([aLineWithTwoTexts().properties, aLineWithOneTextAndPositionYIncremented().properties]).properties,
        }).properties,
      ).properties;

      expect(
        FdsTreeCleanerService.cleanFDSTree(fdsTreeSection3, {
          fromImage: false,
          xCounts: {
            [POSITION_X]: 4,
          },
        }),
      ).toEqual(fdsTreeSection3);
    });
  });
});
