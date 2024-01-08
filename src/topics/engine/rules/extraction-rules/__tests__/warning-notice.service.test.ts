import { describe, expect, it } from 'vitest';
import { type IMetaData, type IExtractedWarningNotice, ProductWarningNotice } from '@padoa/chemical-risk';
import _ from 'lodash';

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
  const metaData: IMetaData = { startBox: aPosition().build() };

  describe('Regexps tests', () => {
    describe('WARNING_NOTICE_IDENTIFIER_REGEX', () => {
      it.each<{ input: string; expected: string }>([
        { input: "mentiond'avertissement", expected: "mentiond'avertissement" },
        { input: "mention d ' avertissement", expected: "mention d ' avertissement" },
        { input: "mention d'avertissement", expected: "mention d'avertissement" },
        { input: "mentions d'avertissement", expected: "mentions d'avertissement" },
        { input: "aa mention d'avertisement bb", expected: "mention d'avertisement" },
        { input: "mention d'avertissemant", expected: "mention d'avertissemant" },
        { input: 'mention davertissement', expected: 'mention davertissement' },
        { input: 'mention d avertissement', expected: 'mention d avertissement' },
        { input: 'abcdef mention mention d avertissement abcdef', expected: 'mention d avertissement' },
        { input: 'mention', expected: undefined },
        { input: 'avertissement', expected: undefined },
      ])('should return $expected with input $input', ({ input, expected }) => {
        expect(_.first(input.match(WarningNoticeService.WARNING_NOTICE_IDENTIFIER_REGEX))).toEqual(expected);
      });
    });

    describe('WARNING_NOTICE_VALUE_REGEX_MAPPING -> DANGER', () => {
      it.each<{ input: string; expected: string }>([
        // Classic danger matches
        { input: 'danger', expected: 'danger' },
        { input: 'dangers', expected: 'danger' },
        { input: 'abcdef le danger abcdef', expected: 'danger' },
        { input: 'denger', expected: undefined },
        { input: 'dnger', expected: undefined },
        { input: 'dangre', expected: undefined },
        // WithLookBehind danger matches
        { input: 'mentiondedanger', expected: undefined },
        { input: 'mention dedanger', expected: undefined },
        { input: 'mention de danger', expected: undefined },
        { input: 'mentions de danger', expected: undefined },
        { input: 'une très grande mention de danger en effet', expected: undefined },
        { input: 'mention danger', expected: 'danger' },
        { input: 'de danger', expected: 'danger' },
      ])('should return $expected with input $input', ({ input, expected }) => {
        expect(_.first(input.match(WarningNoticeService.WARNING_NOTICE_VALUE_REGEX_MAPPING[ProductWarningNotice.DANGER]))).toEqual(expected);
      });
    });

    describe('WARNING_NOTICE_VALUE_REGEX_MAPPING -> WARNING', () => {
      it.each<{ input: string; expected: string }>([
        { input: 'attention', expected: 'attention' },
        { input: 'atention', expected: 'atention' },
        { input: 'attantion', expected: 'attantion' },
        { input: 'bonjour attention à tous', expected: 'attention' },
        { input: 'attension', expected: undefined },
        { input: 'attenzion', expected: undefined },
      ])('should return $expected with input $input', ({ input, expected }) => {
        expect(_.first(input.match(WarningNoticeService.WARNING_NOTICE_VALUE_REGEX_MAPPING[ProductWarningNotice.WARNING]))).toEqual(expected);
      });
    });

    describe('WARNING_NOTICE_VALUE_REGEX_MAPPING -> NONE', () => {
      it.each<{ input: string; expected: string }>([
        { input: 'aucun', expected: 'aucun' },
        { input: 'aucuns', expected: 'aucun' },
        { input: 'neant', expected: 'neant' },
        { input: 'néant', expected: 'néant' },
        { input: "pasdementiond'avertissement", expected: 'pasdemention' },
        { input: 'pasdemention', expected: 'pasdemention' },
        { input: 'pas demention', expected: 'pas demention' },
        { input: 'pas de mention', expected: 'pas de mention' },
        { input: "en effet il n'y a pas de mention ici", expected: 'pas de mention' },
        { input: 'aukun', expected: undefined },
        { input: 'nant', expected: undefined },
        { input: 'de mention', expected: undefined },
        { input: 'pa de mention', expected: undefined },
      ])('should return $expected with input $input', ({ input, expected }) => {
        expect(_.first(input.match(WarningNoticeService.WARNING_NOTICE_VALUE_REGEX_MAPPING[ProductWarningNotice.NONE]))).toEqual(expected);
      });
    });
  });

  describe('getWarningNoticeByIdentifier tests', () => {
    it.each<{ message: string; lines: ILine[]; expected: IExtractedWarningNotice }>([
      { message: 'it should return null when providing an empty list', lines: [], expected: null },
      { message: 'it should return null when providing a line without useful texts', lines: [aLineWithTwoTexts().build()], expected: null },
      { message: 'it should return null when providing only an identifier', lines: [aLineWithWarningNoticeIdentifier().build()], expected: null },
      { message: 'it should return null when providing only a value', lines: [aLineWithWarningNoticeValue().build()], expected: null },
      {
        message: 'it should return value when providing a line with identifier and value',
        lines: [aLineWithWarningNoticeIdentifierAndValue().build()],
        expected: { rawValue: RAW_WARNING_NOTICE_VALUE, value: ProductWarningNotice.DANGER, metaData },
      },
      {
        message: 'it should return value when providing a line with identifier and a line with value',
        lines: [aLineWithWarningNoticeIdentifier().build(), aLineWithWarningNoticeValue().build()],
        expected: { rawValue: RAW_WARNING_NOTICE_VALUE, value: ProductWarningNotice.DANGER, metaData },
      },
      {
        message: 'it should skip first lines and return value when providing a line with identifier and value',
        lines: [aLineWithOneText().build(), aLineWithWarningNoticeIdentifier().build(), aLineWithWarningNoticeIdentifierAndValue().build()],
        expected: { rawValue: RAW_WARNING_NOTICE_VALUE, value: ProductWarningNotice.DANGER, metaData },
      },
      {
        message: 'it should return null when given a line with identifier and a line with random text and a line with value',
        lines: [aLineWithWarningNoticeIdentifier().build(), aLineWithOneText().build(), aLineWithWarningNoticeValue().build()],
        expected: null,
      },
      {
        message: 'it should return null when given a line with identifier a line and a line with "mentions de danger" text',
        lines: [
          aLineWithWarningNoticeIdentifier().build(),
          aLine()
            .withTexts([aText().withContent('Mentions de danger')])
            .build(),
        ],
        expected: null,
      },
    ])('$message', ({ lines, expected }) => {
      expect(WarningNoticeService.getWarningNoticeByIdentifier(lines)).toEqual(expected);
    });
  });

  describe('GetWarningNotice tests', () => {
    it.each<{ message: string; fdsTree: IFdsTree; expected: IExtractedWarningNotice }>([
      {
        message: 'should return null when providing an empty fdsTree',
        fdsTree: anEmptyFdsTreeWithAllSections().build(),
        expected: null,
      },
      {
        message: 'should return null when providing a fdsTree without useful info',
        fdsTree: aFdsTreeWithAllSectionsWithoutUsefulInfo().build(),
        expected: null,
      },
      {
        message: 'should return the warning notice when providing a fdsTree with a warning notice',
        fdsTree: aFdsTree()
          .withSection2(aSection().withSubsections({ 2: aSubSection().withLines([aLineWithWarningNoticeIdentifierAndValue()]) }))
          .build(),
        expected: { rawValue: RAW_WARNING_NOTICE_VALUE, value: ProductWarningNotice.DANGER, metaData },
      },
    ])('$message', ({ fdsTree, expected }) => {
      expect(WarningNoticeService.getWarningNotice(fdsTree)).toEqual(expected);
    });
  });
});
