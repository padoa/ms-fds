import { describe, expect, it } from 'vitest';
import _ from 'lodash';
import type { IExtractedDanger, IMetaData } from '@padoa/chemical-risk';

import { anEmptyFdsTreeWithAllSections, aFdsTreeWithAllSectionsWithoutUsefulInfo, aFdsTree } from '@topics/engine/__fixtures__/fds-tree.mother.js';
import { H_DANGER, EUH_DANGER, P_DANGER, MULTIPLE_P_DANGER } from '@topics/engine/__fixtures__/fixtures.constants.js';
import { aLineWithHDanger, aLineWithEuhDanger, aLineWithTwoDangers, aLineWithMultiplePDanger } from '@topics/engine/__fixtures__/line.mother.js';
import { aSection } from '@topics/engine/__fixtures__/section.mother.js';
import { aSubSection } from '@topics/engine/__fixtures__/sub-section.mother.js';
import type { IFdsTree } from '@topics/engine/model/fds.model.js';
import { DangersRulesService } from '@topics/engine/rules/extraction-rules/dangers-rules.service.js';
import { aPosition } from '@topics/engine/__fixtures__/position.mother.js';

describe('DangersRulesService tests', () => {
  const metaData: IMetaData = { startBox: aPosition().properties };

  describe('Regexps tests', () => {
    describe('HAZARDS_REGEX', () => {
      it.each<{ input: string; expected: string }>([
        { input: 'h350i', expected: 'h350i' },
        { input: 'h 350i', expected: 'h 350i' },
        { input: 'h360f', expected: 'h360f' },
        { input: 'h 360f', expected: 'h 360f' },
        { input: 'h360d', expected: 'h360d' },
        { input: 'h 360d', expected: 'h 360d' },
        { input: 'h360fd', expected: 'h360fd' },
        { input: 'h 360fd', expected: 'h 360fd' },
        { input: 'h360df', expected: 'h360df' },
        { input: 'h 360df', expected: 'h 360df' },
        { input: 'h361f', expected: 'h361f' },
        { input: 'h 361f', expected: 'h 361f' },
        { input: 'h361d', expected: 'h361d' },
        { input: 'h 361d', expected: 'h 361d' },
        { input: 'h361fd', expected: 'h361fd' },
        { input: 'h 361fd', expected: 'h 361fd' },
        { input: 'h200', expected: 'h200' },
        { input: 'h300', expected: 'h300' },
        { input: 'h400', expected: 'h400' },
        { input: 'h500', expected: undefined },
        { input: 'h600', expected: undefined },
        { input: 'h700', expected: undefined },
        { input: 'h800', expected: undefined },
        { input: 'h900', expected: undefined },
        { input: '360f', expected: undefined },
        { input: '250', expected: undefined },
        { input: 'h2', expected: undefined },
        { input: 'h25', expected: undefined },
      ])('should return $expected with input $input', ({ input, expected }) => {
        expect(_.first(input.match(DangersRulesService.HAZARDS_REGEX))).toEqual(expected);
      });
    });

    describe('PRECAUTION_REGEX', () => {
      it.each<{ input: string; expected: string }>([
        { input: 'p150', expected: 'p150' },
        { input: 'p  350', expected: 'p  350' },
        { input: 'p421', expected: 'p421' },
        { input: 'p150 + p200', expected: 'p150 + p200' },
        { input: 'p300 + p 400 + p500', expected: 'p300 + p 400 + p500' },
        { input: 'p 250 +', expected: 'p 250 +' },
        { input: 'p  350 + p 450 + p550 +', expected: 'p  350 + p 450 + p550 +' },
        { input: 'p250 +', expected: 'p250 +' }, // TODO: improve regex to avoid this case
        { input: 'p250 + p', expected: 'p250 + ' }, // TODO: improve regex to avoid this case
        { input: 'p250 + p600', expected: 'p250 + ' }, // TODO: improve regex to avoid this case
        { input: 'p600', expected: undefined },
        { input: 'p700', expected: undefined },
        { input: 'p800', expected: undefined },
        { input: 'p900', expected: undefined },
        { input: '600', expected: undefined },
        { input: '600', expected: undefined },
      ])('should return $expected with input $input', ({ input, expected }) => {
        expect(_.first(input.match(DangersRulesService.PRECAUTION_REGEX))).toEqual(expected);
      });
    });

    describe('EUROPEAN_HAZARDS_REGEX', () => {
      it.each<{ input: string; expected: string }>([
        { input: 'euh200', expected: 'euh200' },
        { input: 'euh  250', expected: 'euh  250' },
        { input: 'euh401', expected: 'euh401' },
        { input: 'euh  401', expected: 'euh  401' },
        { input: 'euh021', expected: 'euh021' },
        { input: 'euh150', expected: undefined },
        { input: 'euh 350', expected: undefined },
        { input: 'euh 450', expected: undefined },
        { input: 'euh 550', expected: undefined },
        { input: 'euh 650', expected: undefined },
        { input: 'euh 750', expected: undefined },
        { input: 'euh 850', expected: undefined },
        { input: 'euh 950', expected: undefined },
        { input: 'euh400', expected: undefined },
        { input: '240', expected: undefined },
        { input: 'e240', expected: undefined },
        { input: 'eu240', expected: undefined },
      ])('should return $expected with input $input', ({ input, expected }) => {
        expect(_.first(input.match(DangersRulesService.EUROPEAN_HAZARDS_REGEX))).toEqual(expected);
      });
    });
  });

  describe('GetDangers tests', () => {
    it.each<[{ message: string; fdsTree: IFdsTree; expected: IExtractedDanger[] }]>([
      [{ message: 'it should return null when providing an empty fdsTree', fdsTree: anEmptyFdsTreeWithAllSections().properties, expected: [] }],
      [
        {
          message: 'it should return an empty list when providing texts without dangers',
          fdsTree: aFdsTreeWithAllSectionsWithoutUsefulInfo().properties,
          expected: [],
        },
      ],
      [
        {
          message: 'it should retrieve dangers contained in lines',
          fdsTree: aFdsTree().withSection2(
            aSection().withSubsections({
              2: aSubSection().withLines([aLineWithHDanger().properties, aLineWithEuhDanger().properties]).properties,
            }).properties,
          ).properties,
          expected: [
            { code: H_DANGER, metaData },
            { code: EUH_DANGER, metaData },
          ],
        },
      ],
      [
        {
          message: 'it should retrieve dangers contained in texts and lines',
          fdsTree: aFdsTree().withSection2(
            aSection().withSubsections({
              2: aSubSection().withLines([aLineWithTwoDangers().properties, aLineWithMultiplePDanger().properties]).properties,
            }).properties,
          ).properties,
          expected: [
            { code: H_DANGER, metaData },
            { code: P_DANGER, metaData },
            { code: MULTIPLE_P_DANGER, metaData },
          ],
        },
      ],
    ])('$message', ({ fdsTree, expected }) => {
      expect(DangersRulesService.getDangers(fdsTree)).toEqual(expected);
    });
  });
});
