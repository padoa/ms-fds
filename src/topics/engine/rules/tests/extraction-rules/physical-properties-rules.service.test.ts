import { describe, expect, it } from 'vitest';

import { PhysicalPropertiesRulesService } from '@topics/engine/rules/extraction-rules/physical-properties-rules.service.js';
import type { IFDSTree, ILine } from '@topics/engine/model/fds.model.js';

describe('Physical properties rules service tests', () => {
  describe('Regexps tests', () => {
    describe('PHYSICAL_STATE_IDENTIFIER_REGEX', () => {
      it.each<{ input: string; expected: boolean }>([
        { input: 'étatphysique', expected: true },
        { input: 'etatphysique', expected: true },
        { input: 'aspect', expected: true },
        { input: 'etatphysiqueaspect', expected: true },
        { input: 'état', expected: false },
        { input: 'etat', expected: false },
        { input: 'aspec', expected: false },
      ])('should return $expected with input $input', ({ input, expected }) => {
        expect(!!input.match(PhysicalPropertiesRulesService.PHYSICAL_STATE_IDENTIFIER_REGEX)).toEqual(expected);
      });
    });

    describe('PHYSICAL_STATE_VALUES_REGEX', () => {
      it.each<{ input: string; expected: boolean }>([
        { input: 'liquide', expected: true },
        { input: 'gaz', expected: true },
        { input: 'poudre', expected: true },
        { input: 'granulé', expected: true },
        { input: 'granule', expected: true },
        { input: 'aérosol', expected: true },
        { input: 'aerosol', expected: true },
        { input: 'solide', expected: true },
        { input: 'grain', expected: true },
        { input: 'pastille', expected: true },
        { input: 'copeaux', expected: true },
        { input: 'pate', expected: true },
        { input: 'pâte', expected: true },
        { input: 'fluide', expected: true },
        { input: 'liquid', expected: false },
        { input: 'ga', expected: false },
        { input: 'poudr', expected: false },
        { input: 'granul', expected: false },
        { input: 'rosol', expected: false },
        { input: 'solid', expected: false },
        { input: 'grai', expected: false },
        { input: 'pastil', expected: false },
        { input: 'copeau', expected: false },
        { input: 'fluid', expected: false },
      ])('should return $expected with input $input', ({ input, expected }) => {
        expect(!!input.match(PhysicalPropertiesRulesService.PHYSICAL_STATE_VALUES_REGEX)).toEqual(expected);
      });
    });
  });

  // TODO waiting for Théo to merge
  describe('getPhysicalStateByText', () => {
    it.each<{ message: string; lines: ILine[]; expected: boolean }>([
      { message: 'should return X when the first line contains aspect with a potential value' },
      { message: 'should return X when a line contains aspect with a potential value' },
      { message: 'should return null when no line matches PHYSICAL_STATE_IDENTIFIER_REGEX' },
      { message: 'should not match a line containing aspect without a potential value' },
      {
        message:
          'should return X when a line contains aspect without a potential value even if there is a previous line containing value but without a potential value',
      },
      { message: 'should clean the trailing dot of a value' },
    ])('$message', ({ lines, expected }) => {
      expect(PhysicalPropertiesRulesService.getPhysicalStateByText(lines)).toMatchObject({ value: expected });
    });
  });

  describe('getPhysicalStateByValue', () => {
    it.each<{ message: string; lines: ILine[]; expected: boolean }>([
      { message: 'should return X when the first line contains a potential value' },
      { message: 'should return X when a line contains a potential value' },
      { message: 'should return null when no line matches PHYSICAL_STATE_VALUES_REGEX' },
      { message: 'should clean the trailing dot of a value' },
    ])('$message', ({ lines, expected }) => {
      expect(PhysicalPropertiesRulesService.getPhysicalStateByValue(lines)).toMatchObject({ value: expected });
    });
  });

  describe('getPhysicalState', () => {
    it.each<{ message: string; fdsTree: IFDSTree; expected: boolean }>([
      { message: 'should return null when the fdsTree contains no line in subsection 9.1' },
      { message: 'should priorize getting the value by text instead of value' },
      { message: 'should use the rule by value if there is not matching text' },
    ])('$message', ({ fdsTree, expected }) => {
      expect(PhysicalPropertiesRulesService.getPhysicalState(fdsTree)).toMatchObject({ value: expected });
    });
  });
});
