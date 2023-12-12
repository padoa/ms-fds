import { describe, expect, it } from 'vitest';

import { BoilingPointRulesService } from '@topics/engine/rules/extraction-rules/boiling-point-rules.service.js';
import { aFdsTree, anEmptyFdsTreeWithAllSections, aFdsTreeWithAllSectionsWithoutUsefulInfo } from '@topics/engine/__fixtures__/fds-tree.mother.js';
import type { IExtractedBoilingPoint, IFdsTree, IMetaData } from '@topics/engine/model/fds.model.js';
import { aSection } from '@topics/engine/__fixtures__/section.mother.js';
import { aSubSection } from '@topics/engine/__fixtures__/sub-section.mother.js';
import { aLine, aLineWithBoilingPointIdentifierAndValue } from '@topics/engine/__fixtures__/line.mother.js';
import { BOILING_POINT_VALUE } from '@topics/engine/__fixtures__/fixtures.constants.js';
import { aPosition } from '@topics/engine/__fixtures__/position.mother.js';
import { aTextWithBoilingPointIdentifier } from '@topics/engine/__fixtures__/text.mother.js';

describe('BoilingPointRulesService tests', () => {
  describe('Regexps tests', () => {
    describe('BOILING_POINT_IDENTIFIER_REGEX', () => {
      it.each<{ input: string; expected: boolean }>([
        { input: 'ebullition', expected: true },
        { input: 'ébullition', expected: true },
        { input: 'ebulition', expected: false },
        { input: 'ébulition', expected: false },
      ])('should return $expected with input $input', ({ input, expected }) => {
        expect(new RegExp(BoilingPointRulesService.BOILING_POINT_IDENTIFIER_REGEX).test(input)).toEqual(expected);
      });
    });

    describe('BOILING_POINT_VALUE_REGEX', () => {
      it.each<{ input: string; expected: boolean }>([
        { input: '150 °c', expected: true },
        { input: '12.01 °f', expected: true },
        { input: '420,42565 °k', expected: true },
        { input: '> 105-250°c', expected: true },
        { input: '<20°c', expected: true },
        { input: '<= 20 ° c', expected: true },
        { input: '>= 45° c', expected: true },
        { input: '≤ 1200 °c', expected: true },
        { input: '≥ 1242,1°c', expected: true },
        { input: '165-250°c', expected: true },
        { input: '123,45 - 155 °c', expected: true },
        { input: '123 - 155.043 °c', expected: true },
        { input: '>123-155.043°c', expected: true },
        { input: '120', expected: false },
        { input: '°c', expected: false },
        { input: '1 °', expected: false },
        { input: '165 - °c', expected: false },
        { input: '> °c', expected: false },
        { input: '150 °xyz', expected: false },
      ])('should return $expected with input $input', ({ input, expected }) => {
        expect(new RegExp(BoilingPointRulesService.BOILING_POINT_VALUE_REGEX).test(input)).toEqual(expected);
      });
    });
  });

  describe('GetBoilingPoint tests', () => {
    const metaData: IMetaData = { startBox: aPosition().properties };

    it.each<[{ message: string; fdsTree: IFdsTree; expected: IExtractedBoilingPoint }]>([
      [
        {
          message: 'it should return null when given a fds tree without lines',
          fdsTree: aFdsTree().properties,
          expected: null,
        },
      ],
      [
        {
          message: 'it should return null when given an empty fds tree',
          fdsTree: anEmptyFdsTreeWithAllSections().properties,
          expected: null,
        },
      ],
      [
        {
          message: 'it should return null when given a text without boiling point pressure',
          fdsTree: aFdsTreeWithAllSectionsWithoutUsefulInfo().properties,
          expected: null,
        },
      ],
      [
        {
          message: 'it should return boiling point when it is contained in 2 texts',
          fdsTree: aFdsTree().withSection9(
            aSection().withSubsections({
              1: aSubSection().withLines([aLineWithBoilingPointIdentifierAndValue().properties]).properties,
            }).properties,
          ).properties,
          expected: { value: BOILING_POINT_VALUE, metaData },
        },
      ],
      [
        {
          message: 'it should skip first identifier if there is no vapor pressure value',
          fdsTree: aFdsTree().withSection9(
            aSection().withSubsections({
              1: aSubSection().withLines([
                aLine().withTexts([aTextWithBoilingPointIdentifier().properties]).properties,
                aLineWithBoilingPointIdentifierAndValue().properties,
              ]).properties,
            }).properties,
          ).properties,
          expected: { value: BOILING_POINT_VALUE, metaData },
        },
      ],
    ])('$message', ({ fdsTree, expected }) => {
      expect(BoilingPointRulesService.getBoilingPoint(fdsTree)).toEqual(expected);
    });
  });
});
