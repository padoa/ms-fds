import { describe, expect, it } from 'vitest';
import type { IMetaData, IExtractedWarningNotice } from '@padoa/chemical-risk';

import { WarningNoticeService } from '@topics/engine/rules/extraction-rules/warning-notice.service.js';
import type { IFdsTree, ILine } from '@topics/engine/model/fds.model.js';
import { aPosition } from '@topics/engine/__fixtures__/position.mother.js';
import {
  aLineWithOneText,
  aLineWithTwoTexts,
  aLineWithWarningNoticeIdentifier,
  aLineWithWarningNoticeIdentifierAndValue,
  aLineWithWarningNoticeValue,
} from '@topics/engine/__fixtures__/line.mother.js';
import { RAW_WARNING_NOTICE_VALUE } from '@topics/engine/__fixtures__/fixtures.constants.js';
import { anEmptyFdsTreeWithAllSections, aFdsTreeWithAllSectionsWithoutUsefulInfo, aFdsTree } from '@topics/engine/__fixtures__/fds-tree.mother.js';
import { aSection } from '@topics/engine/__fixtures__/section.mother.js';
import { aSubSection } from '@topics/engine/__fixtures__/sub-section.mother.js';

describe('WarningNoticeService tests', () => {
  const metaData: IMetaData = { startBox: aPosition().properties };

  describe('GetWarningNotice tests', () => {
    it.each<{ message: string; fdsTree: IFdsTree; expected: IExtractedWarningNotice }>([
      {
        message: 'should return null when providing an empty fdsTree',
        fdsTree: anEmptyFdsTreeWithAllSections().properties,
        expected: null,
      },
      {
        message: 'should return null when providing a fdsTree without useful info',
        fdsTree: aFdsTreeWithAllSectionsWithoutUsefulInfo().properties,
        expected: null,
      },
      {
        message: 'should return the warning notice when providing a fdsTree with a warning notice',
        fdsTree: aFdsTree().withSection2(
          aSection().withSubsections({ 2: aSubSection().withLines([aLineWithWarningNoticeIdentifierAndValue().properties]).properties }).properties,
        ).properties,
        expected: { value: RAW_WARNING_NOTICE_VALUE, metaData },
      },
    ])('$message', ({ fdsTree, expected }) => {
      expect(WarningNoticeService.getWarningNotice(fdsTree)).toEqual(expected);
    });
  });

  describe('GetWarningNoticeByValue tests', () => {
    it.each<{ message: string; lines: ILine[]; expected: IExtractedWarningNotice }>([
      { message: 'it should return null when providing an empty list', lines: [], expected: null },
      { message: 'it should return null when providing a line without useful texts', lines: [aLineWithTwoTexts().properties], expected: null },
      { message: 'it should return null when providing only an identifier', lines: [aLineWithWarningNoticeIdentifier().properties], expected: null },
      { message: 'it should return null when providing only a value', lines: [aLineWithWarningNoticeValue().properties], expected: null },
      {
        message: 'it should return value when providing a line with identifier and value',
        lines: [aLineWithWarningNoticeIdentifierAndValue().properties],
        expected: { value: RAW_WARNING_NOTICE_VALUE, metaData },
      },
      {
        message: 'it should return value when providing a line with identifier and a line with value',
        lines: [aLineWithWarningNoticeIdentifier().properties, aLineWithWarningNoticeValue().properties],
        expected: { value: RAW_WARNING_NOTICE_VALUE, metaData },
      },
      {
        message: 'it should skip first lines and return value when providing a line with identifier and value',
        lines: [aLineWithOneText().properties, aLineWithWarningNoticeIdentifier().properties, aLineWithWarningNoticeIdentifierAndValue().properties],
        expected: { value: RAW_WARNING_NOTICE_VALUE, metaData },
      },
      {
        message: 'it should return null when given a line with identifier and a line with random text and a line with value',
        lines: [aLineWithWarningNoticeIdentifier().properties, aLineWithOneText().properties, aLineWithWarningNoticeValue().properties],
        expected: null,
      },
    ])('$message', ({ lines, expected }) => {
      expect(WarningNoticeService.getWarningNoticeByValue(lines)).toEqual(expected);
    });
  });
});
