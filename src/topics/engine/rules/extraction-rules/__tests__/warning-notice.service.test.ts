import { describe, expect, it } from 'vitest';
import { type IMetaData, type IExtractedWarningNotice, ProductWarningNotice } from '@padoa/chemical-risk';

import { WarningNoticeService } from '@topics/engine/rules/extraction-rules/warning-notice.service.js';
import type { IFdsTree, ILine } from '@topics/engine/model/fds.model.js';
import { aPosition } from '@topics/engine/__fixtures__/position.mother.js';
import {
  aLine,
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
import { aText } from '@topics/engine/__fixtures__/text.mother.js';

describe('WarningNoticeService tests', () => {
  const metaData: IMetaData = { startBox: aPosition().properties };

  describe('Regexps tests', () => {
    describe('WARNING_NOTICE_IDENTIFIER_REGEX', () => {
      it.each<{ input: string; expected: boolean }>([
        { input: "mentiond'avertissement", expected: true },
        { input: "mention d ' avertissement", expected: true },
        { input: "mention d'avertissement", expected: true },
        { input: "mentions d'avertissement", expected: true },
        { input: "mention d'avertisement", expected: true },
        { input: "mention d'avertissemant", expected: true },
        { input: 'mention', expected: false },
        { input: 'avertissement', expected: false },
        { input: 'mention davertissement', expected: false },
      ])('should return $expected with input $input', ({ input, expected }) => {
        expect(new RegExp(WarningNoticeService.WARNING_NOTICE_IDENTIFIER_REGEX).test(input)).toEqual(expected);
      });
    });

    describe('DANGER_NOTICE_REGEX', () => {
      it.each<{ input: string; expected: boolean }>([
        { input: 'mentiondedanger', expected: true },
        { input: 'mention dedanger', expected: true },
        { input: 'mention de danger', expected: true },
        { input: 'mentions de danger', expected: true },
        { input: 'mention', expected: false },
        { input: 'de danger', expected: false },
        { input: 'danger', expected: false },
      ])('should return $expected with input $input', ({ input, expected }) => {
        expect(new RegExp(WarningNoticeService.DANGER_NOTICE_REGEX).test(input)).toEqual(expected);
      });
    });

    describe('WARNING_NOTICE_VALUE_REGEX_MAPPING -> DANGER', () => {
      it.each<{ input: string; expected: boolean }>([
        { input: 'danger', expected: true },
        { input: 'dangers', expected: true },
        { input: 'denger', expected: false },
        { input: 'dnger', expected: false },
        { input: 'dangre', expected: false },
      ])('should return $expected with input $input', ({ input, expected }) => {
        expect(WarningNoticeService.WARNING_NOTICE_VALUE_REGEX_MAPPING.danger.test(input)).toEqual(expected);
      });
    });

    describe('WARNING_NOTICE_VALUE_REGEX_MAPPING -> WARNING', () => {
      it.each<{ input: string; expected: boolean }>([
        { input: 'attention', expected: true },
        { input: 'atention', expected: true },
        { input: 'attantion', expected: true },
        { input: 'attension', expected: false },
        { input: 'attenzion', expected: false },
      ])('should return $expected with input $input', ({ input, expected }) => {
        expect(WarningNoticeService.WARNING_NOTICE_VALUE_REGEX_MAPPING.warning.test(input)).toEqual(expected);
      });
    });

    describe('WARNING_NOTICE_VALUE_REGEX_MAPPING -> NONE', () => {
      it.each<{ input: string; expected: boolean }>([
        { input: 'aucun', expected: true },
        { input: 'aucuns', expected: true },
        { input: 'neant', expected: true },
        { input: 'néant', expected: true },
        { input: "pasdementiond'avertissement", expected: true },
        { input: 'pasdemention', expected: true },
        { input: 'pas demention', expected: true },
        { input: 'pas de mention', expected: true },
        { input: 'aukun', expected: false },
        { input: 'nant', expected: false },
        { input: 'de mention', expected: false },
        { input: 'pa de mention', expected: false },
      ])('should return $expected with input $input', ({ input, expected }) => {
        expect(WarningNoticeService.WARNING_NOTICE_VALUE_REGEX_MAPPING.none.test(input)).toEqual(expected);
      });
    });
  });

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
        expected: { rawValue: RAW_WARNING_NOTICE_VALUE, value: ProductWarningNotice.DANGER, metaData },
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
        expected: { rawValue: RAW_WARNING_NOTICE_VALUE, value: ProductWarningNotice.DANGER, metaData },
      },
      {
        message: 'it should return value when providing a line with identifier and a line with value',
        lines: [aLineWithWarningNoticeIdentifier().properties, aLineWithWarningNoticeValue().properties],
        expected: { rawValue: RAW_WARNING_NOTICE_VALUE, value: ProductWarningNotice.DANGER, metaData },
      },
      {
        message: 'it should skip first lines and return value when providing a line with identifier and value',
        lines: [aLineWithOneText().properties, aLineWithWarningNoticeIdentifier().properties, aLineWithWarningNoticeIdentifierAndValue().properties],
        expected: { rawValue: RAW_WARNING_NOTICE_VALUE, value: ProductWarningNotice.DANGER, metaData },
      },
      {
        message: 'it should return null when given a line with identifier and a line with random text and a line with value',
        lines: [aLineWithWarningNoticeIdentifier().properties, aLineWithOneText().properties, aLineWithWarningNoticeValue().properties],
        expected: null,
      },
      {
        message: 'it should return null when given a line with identifier a line and a line with "mentions de danger" text',
        lines: [aLineWithWarningNoticeIdentifier().properties, aLine().withTexts([aText().withContent('Mentions de danger').properties]).properties],
        expected: null,
      },
    ])('$message', ({ lines, expected }) => {
      expect(WarningNoticeService.getWarningNoticeByValue(lines)).toEqual(expected);
    });
  });
});
