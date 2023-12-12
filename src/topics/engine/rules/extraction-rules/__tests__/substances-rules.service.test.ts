import { describe, expect, it } from 'vitest';

import { SubstancesRulesService } from '@topics/engine/rules/extraction-rules/substances-rules.service.js';
import { anEmptyFdsTreeWithAllSections, aFdsTreeWithAllSectionsWithoutUsefulInfo, aFdsTree } from '@topics/engine/__fixtures__/fds-tree.mother.js';
import { CAS_NUMBER, CE_NUMBER } from '@topics/engine/__fixtures__/fixtures.constants.js';
import { aLineWithCASAndCENumberIn2Texts, aLineWithCENumber, aLineWithCASNumber } from '@topics/engine/__fixtures__/line.mother.js';
import { aSection } from '@topics/engine/__fixtures__/section.mother.js';
import { aSubSection } from '@topics/engine/__fixtures__/sub-section.mother.js';
import type { IFdsTree, IExtractedSubstance, IMetaData } from '@topics/engine/model/fds.model.js';
import { aPosition } from '@topics/engine/__fixtures__/position.mother.js';

describe('SubstancesRulesService tests', () => {
  const metaData: IMetaData = { startBox: aPosition().properties };

  describe('Regexps tests', () => {
    describe('CASNumberRegex tests', () => {
      it.each<[{ input: string; expected: boolean }]>([
        [{ input: '1234567-12-3', expected: true }],
        [{ input: '1234567 - 12 - 3', expected: true }],
        [{ input: '1234567 -12 -3', expected: true }],
        [{ input: '1234567 -12-3', expected: true }],
        [{ input: '1234567-12 -3', expected: true }],
        [{ input: '9876543-45-6', expected: true }],
        [{ input: '111-22-3', expected: true }],
        [{ input: '987-65-4', expected: true }],
        [{ input: '1-23-4', expected: true }],
        [{ input: '-1234567-12-3', expected: false }],
        [{ input: '1234567-12-3-', expected: false }],
        [{ input: '12-34567-12-3', expected: false }],
        [{ input: '1234567-123-3', expected: false }],
        [{ input: '1234567-12-3-4', expected: false }],
        [{ input: 'abc-12-34', expected: false }],
        [{ input: '12-34-def', expected: false }],
        [{ input: '12-34-56789', expected: false }],
        [{ input: '12-34', expected: false }],
        [{ input: '12-34-', expected: false }],
      ])('$input payload should return $expected', ({ input, expected }) => {
        expect(new RegExp(SubstancesRulesService.CAS_NUMBER_REGEX).test(input)).toEqual(expected);
      });
    });

    describe('CENumberRegex tests', () => {
      it.each<[{ input: string; expected: boolean }]>([
        [{ input: '123-456-7', expected: true }],
        [{ input: '123 - 456 - 7', expected: true }],
        [{ input: '123 -456 -7', expected: true }],
        [{ input: '123 -456-7', expected: true }],
        [{ input: '123-456 -7', expected: true }],
        [{ input: '987-654-3', expected: true }],
        [{ input: '111-222-3', expected: true }],
        [{ input: '987-654-3', expected: true }],
        [{ input: '1-234-5', expected: false }],
        [{ input: '1-23-456-7', expected: false }],
        [{ input: '123-456-78', expected: false }],
        [{ input: 'abc-123-456', expected: false }],
        [{ input: '123-abc-456', expected: false }],
        [{ input: '123-456-', expected: false }],
      ])('$input payload should return $expected', ({ input, expected }) => {
        expect(new RegExp(SubstancesRulesService.CE_NUMBER_REGEX).test(input)).toEqual(expected);
      });
    });
  });

  describe('Substances rules tests', () => {
    describe('GetSubstances tests', () => {
      it.each<[{ message: string; fdsTree: IFdsTree; expected: IExtractedSubstance[] }]>([
        [
          {
            message: 'it should return an empty list when given an empty fdsTree',
            fdsTree: anEmptyFdsTreeWithAllSections().properties,
            expected: [],
          },
        ],
        [
          {
            message: 'it should return an empty list when given a text without cas nor ce number',
            fdsTree: aFdsTreeWithAllSectionsWithoutUsefulInfo().properties,
            expected: [],
          },
        ],
        [
          {
            message: 'it should return cas and ce number when it is contained in 2 texts',
            fdsTree: aFdsTree().withSection3(
              aSection().withSubsections({
                1: aSubSection().withLines([aLineWithCASAndCENumberIn2Texts().properties]).properties,
              }).properties,
            ).properties,
            expected: [{ casNumber: CAS_NUMBER, ceNumber: CE_NUMBER, metaData }],
          },
        ],
        [
          {
            message: 'it should return ce number even when cas number is missing',
            fdsTree: aFdsTree().withSection3(
              aSection().withSubsections({
                1: aSubSection().withLines([aLineWithCENumber().properties]).properties,
              }).properties,
            ).properties,
            expected: [{ casNumber: undefined, ceNumber: CE_NUMBER, metaData }],
          },
        ],
        [
          {
            message: 'it should return ce number even when it is contained in 2 lines',
            fdsTree: aFdsTree().withSection3(
              aSection().withSubsections({
                1: aSubSection().withLines([aLineWithCASNumber().properties, aLineWithCENumber().properties]).properties,
              }).properties,
            ).properties,
            expected: [{ casNumber: CAS_NUMBER, ceNumber: CE_NUMBER, metaData }],
          },
        ],
        [
          {
            message: 'it should return cas number even when it is contained in 2 lines',
            fdsTree: aFdsTree().withSection3(
              aSection().withSubsections({
                1: aSubSection().withLines([aLineWithCENumber().properties, aLineWithCASNumber().properties]).properties,
              }).properties,
            ).properties,
            expected: [{ casNumber: CAS_NUMBER, ceNumber: CE_NUMBER, metaData }],
          },
        ],
      ])('$message', ({ fdsTree, expected }) => {
        expect(SubstancesRulesService.getSubstances(fdsTree)).toEqual(expected);
      });
    });
  });
});
