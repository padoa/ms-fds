import type { SpyInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import _ from 'lodash';

import { aFdsTree } from '@topics/engine/__fixtures__/fds-tree.mother.js';
import { aSection } from '@topics/engine/__fixtures__/section.mother.js';
import { aSubSection } from '@topics/engine/__fixtures__/sub-section.mother.js';
import { INCREMENT_VALUE, POSITION_PROPORTION_X, TEXT_CONTENT } from '@topics/engine/__fixtures__/fixtures.constants.js';
import type { ILine, IXCounts } from '@topics/engine/model/fds.model.js';
import { aLineWithOneText, aLineWithOneTextAndPositionYIncremented, aLine, aLineWithTwoTexts } from '@topics/engine/__fixtures__/line.mother.js';
import {
  aTextWithContentAndPosition,
  aTextWithContentAndPositionXIncremented,
  aTextWithContentAndPositionXIncrementedTwice,
  aTextWithPosition,
} from '@topics/engine/__fixtures__/text.mother.js';
import { FdsTreeCleanerService } from '@topics/engine/transformer/fds-tree-cleaner.service.js';

describe('FdsTreeCleanerService Tests', () => {
  let XHighestAlignmentValueSpy: SpyInstance<[], number>;

  describe('CleanLine Tests', () => {
    const xCountsToShrinkTexts: IXCounts = {
      [POSITION_PROPORTION_X]: 2,
      [POSITION_PROPORTION_X + INCREMENT_VALUE]: 1,
      [POSITION_PROPORTION_X + 2 * INCREMENT_VALUE]: 1,
      [POSITION_PROPORTION_X + 3 * INCREMENT_VALUE]: 3,
      [POSITION_PROPORTION_X + 4 * INCREMENT_VALUE]: 3,
      [POSITION_PROPORTION_X + 5 * INCREMENT_VALUE]: 3,
      [POSITION_PROPORTION_X + 6 * INCREMENT_VALUE]: 3,
      [POSITION_PROPORTION_X + 7 * INCREMENT_VALUE]: 3,
      [POSITION_PROPORTION_X + 8 * INCREMENT_VALUE]: 3,
      [POSITION_PROPORTION_X + 9 * INCREMENT_VALUE]: 3,
      [POSITION_PROPORTION_X + 10 * INCREMENT_VALUE]: 3,
      [POSITION_PROPORTION_X + 11 * INCREMENT_VALUE]: 3,
      [POSITION_PROPORTION_X + 12 * INCREMENT_VALUE]: 3,
    };

    it.each<{ message: string; line: ILine; xCounts: IXCounts; joinWithSpace: boolean; expected: ILine }>([
      {
        message: 'should return the same line if is first text',
        line: aLineWithOneText().properties,
        xCounts: { [POSITION_PROPORTION_X]: 2 },
        joinWithSpace: false,
        expected: aLineWithOneText().properties,
      },
      {
        message: 'should return the same lines when xcount is below computedXHighestAlignmentValue',
        line: aLineWithTwoTexts().properties,
        xCounts: { [POSITION_PROPORTION_X]: 2, [POSITION_PROPORTION_X + INCREMENT_VALUE]: 1 },
        joinWithSpace: false,
        expected: aLineWithTwoTexts().properties,
      },
      {
        message: 'should shrink with previous text when xcount is above computedXHighestAlignmentValue and joinWithSpace is false',
        line: aLineWithTwoTexts().properties,
        xCounts: xCountsToShrinkTexts,
        joinWithSpace: false,
        expected: aLine().withTexts([aTextWithPosition().withContent(TEXT_CONTENT.repeat(2)).properties]).properties,
      },
      {
        message: 'should shrink with previous text when xcount is above computedXHighestAlignmentValue and joinWithSpace is true',
        line: aLineWithTwoTexts().properties,
        xCounts: xCountsToShrinkTexts,
        joinWithSpace: true,
        expected: aLine().withTexts([aTextWithPosition().withContent(`${TEXT_CONTENT} ${TEXT_CONTENT}`).properties]).properties,
      },
    ])('$message', ({ line, xCounts, joinWithSpace, expected }) => {
      expect(FdsTreeCleanerService.cleanLine(line, { xCounts, joinWithSpace })).toEqual(expected);
    });
  });

  describe('CleanFdsTree tests', () => {
    const fdsTree = aFdsTree().withSection1(
      aSection().withSubsections({
        1: aSubSection().withLines([
          aLine().withTexts([
            aTextWithContentAndPosition().properties,
            aTextWithContentAndPositionXIncremented().properties,
            aTextWithContentAndPositionXIncrementedTwice().properties,
            aTextWithContentAndPosition().properties,
          ]).properties,
        ]).properties,
      }).properties,
    ).properties;
    const xCounts = {
      [POSITION_PROPORTION_X]: 4,
      [POSITION_PROPORTION_X + INCREMENT_VALUE]: 1,
      [POSITION_PROPORTION_X + 2 * INCREMENT_VALUE]: 1,
      [POSITION_PROPORTION_X + 3 * INCREMENT_VALUE]: 1,
    };

    beforeEach(() => {
      XHighestAlignmentValueSpy = vi.spyOn(FdsTreeCleanerService, 'XHighestAlignmentValue', 'get').mockImplementationOnce(() => 1);
    });

    afterEach(() => {
      XHighestAlignmentValueSpy.mockRestore();
    });

    it('should clean the given fds tree by concatenating texts without joining with Space', () => {
      const expected = aFdsTree().withSection1(
        aSection().withSubsections({
          1: aSubSection().withLines([
            aLine().withTexts([
              aTextWithContentAndPosition().withContent(`${TEXT_CONTENT.repeat(3)}`).properties,
              aTextWithContentAndPosition().properties,
            ]).properties,
          ]).properties,
        }).properties,
      ).properties;

      expect(
        FdsTreeCleanerService.cleanFdsTree(fdsTree, {
          fromImage: false,
          xCounts,
        }),
      ).toEqual(expected);
    });

    it('should clean the given fds tree by concatenating texts joining with Space', () => {
      const expected = aFdsTree().withSection1(
        aSection().withSubsections({
          1: aSubSection().withLines([
            aLine().withTexts([
              aTextWithContentAndPosition().withContent(`${_.times(3, () => TEXT_CONTENT).join(' ')}`).properties,
              aTextWithContentAndPosition().properties,
            ]).properties,
          ]).properties,
        }).properties,
      ).properties;

      expect(
        FdsTreeCleanerService.cleanFdsTree(fdsTree, {
          fromImage: true,
          xCounts,
        }),
      ).toEqual(expected);
    });

    it('should return the same subSections as given inside section3', () => {
      const fdsTreeSection3 = aFdsTree().withSection3(
        aSection().withSubsections({
          1: aSubSection().withLines([aLineWithTwoTexts().properties, aLineWithOneTextAndPositionYIncremented().properties]).properties,
        }).properties,
      ).properties;

      expect(
        FdsTreeCleanerService.cleanFdsTree(fdsTreeSection3, {
          fromImage: false,
          xCounts: {
            [POSITION_PROPORTION_X]: 4,
          },
        }),
      ).toEqual(fdsTreeSection3);
    });
  });
});
