import { describe, expect, it } from 'vitest';

import {
  aLine,
  aLineWithPhysicalStateIdentifier,
  aLineWithPhysicalStateIdentifierAndValue,
  aLineWithPhysicalStateValue,
} from '@topics/engine/__fixtures__/line.mother.js';
import {
  CLEAN_PHYSICAL_STATE_IDENTIFIER,
  CLEAN_PHYSICAL_STATE_VALUE,
  RAW_PHYSICAL_STATE_IDENTIFIER,
  RAW_PHYSICAL_STATE_VALUE,
} from '@topics/engine/__fixtures__/fixtures.constants.js';
import { aText } from '@topics/engine/__fixtures__/text.mother.js';
import { aFdsTree } from '@topics/engine/__fixtures__/fds-tree.mother.js';
import { aSection } from '@topics/engine/__fixtures__/section.mother.js';
import { aSubSection } from '@topics/engine/__fixtures__/sub-section.mother.js';
import { PhysicalStateRulesService } from '@topics/engine/rules/extraction-rules/physical-state-rules.service.js';
import type { IFdsTree, ILine } from '@topics/engine/model/fds.model.js';

describe('PhysicalStateRulesService tests', () => {
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
        expect(new RegExp(PhysicalStateRulesService.PHYSICAL_STATE_IDENTIFIER_REGEX).test(input)).toEqual(expected);
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
        expect(new RegExp(PhysicalStateRulesService.PHYSICAL_STATE_VALUES_REGEX).test(input)).toEqual(expected);
      });
    });
  });

  describe('getPhysicalStateByText', () => {
    it.each<{ message: string; lines: ILine[]; expected: string }>([
      {
        message: 'should return physical state value when the first line contains identifier with a value',
        lines: [aLineWithPhysicalStateIdentifierAndValue().properties],
        expected: CLEAN_PHYSICAL_STATE_VALUE,
      },
      {
        message: 'should return physical state value when a line contains identifier with a value',
        lines: [aLine().properties, aLineWithPhysicalStateIdentifierAndValue().properties],
        expected: CLEAN_PHYSICAL_STATE_VALUE,
      },
      {
        message: 'should return null when no line matches PHYSICAL_STATE_IDENTIFIER_REGEX',
        lines: [aLine().properties],
        expected: null,
      },
      {
        message: 'should not match a line containing identifier without a value',
        lines: [aLineWithPhysicalStateIdentifier().properties],
        expected: null,
      },
      {
        message:
          'should return physical state value when a line contains identifier without a value even if there is a previous line containing value but without a potential value',
        lines: [aLineWithPhysicalStateIdentifier().properties, aLineWithPhysicalStateIdentifierAndValue().properties],
        expected: CLEAN_PHYSICAL_STATE_VALUE,
      },
      {
        message: 'should return physical state value when a text contains the identifier and the value separated by a colon',
        lines: [
          aLine().withTexts([
            aText()
              .withRawContent(`${RAW_PHYSICAL_STATE_VALUE}:${RAW_PHYSICAL_STATE_VALUE}`)
              .withCleanContent(`${CLEAN_PHYSICAL_STATE_IDENTIFIER}:${CLEAN_PHYSICAL_STATE_VALUE}`).properties,
          ]).properties,
        ],
        expected: CLEAN_PHYSICAL_STATE_VALUE,
      },
      {
        message: 'should clean the trailing dot of a value',
        lines: [
          aLine().withTexts([
            aText().withRawContent(`${RAW_PHYSICAL_STATE_IDENTIFIER}`).withCleanContent(`${CLEAN_PHYSICAL_STATE_IDENTIFIER}`).properties,
            aText().withRawContent(`${RAW_PHYSICAL_STATE_VALUE}`).withCleanContent(`${CLEAN_PHYSICAL_STATE_VALUE}. `).properties,
          ]).properties,
        ],
        expected: CLEAN_PHYSICAL_STATE_VALUE,
      },
    ])('$message', ({ lines, expected }) => {
      expect(PhysicalStateRulesService.getPhysicalStateByText(lines)).toMatchObject(expected ? { value: expected } : expected);
    });
  });

  describe('getPhysicalStateByValue', () => {
    it.each<{ message: string; lines: ILine[]; expected: string }>([
      {
        message: 'should return physical state value when the first line contains a potential value',
        lines: [aLineWithPhysicalStateValue().properties],
        expected: CLEAN_PHYSICAL_STATE_VALUE,
      },
      {
        message: 'should return physical state value when a line contains a potential value',
        lines: [aLine().properties, aLineWithPhysicalStateValue().properties],
        expected: CLEAN_PHYSICAL_STATE_VALUE,
      },
      { message: 'should return null when no line matches PHYSICAL_STATE_VALUES_REGEX', lines: [aLine().properties], expected: null },
      {
        message: 'should clean the trailing dot of a value',
        lines: [
          aLine().withTexts([aText().withRawContent(`${RAW_PHYSICAL_STATE_VALUE}`).withCleanContent(`${CLEAN_PHYSICAL_STATE_VALUE}. `).properties])
            .properties,
        ],
        expected: CLEAN_PHYSICAL_STATE_VALUE,
      },
    ])('$message', ({ lines, expected }) => {
      expect(PhysicalStateRulesService.getPhysicalStateByValue(lines)).toMatchObject(expected ? { value: expected } : expected);
    });
  });

  describe('getPhysicalState', () => {
    it.each<{ message: string; fdsTree: IFdsTree; expected: string }>([
      {
        message: 'should return null when the fdsTree contains no line in subsection 9.1',
        fdsTree: aFdsTree().properties,
        expected: null,
      },
      {
        message: 'should priorize getting the value by text instead of value',
        fdsTree: aFdsTree().withSection9(
          aSection().withSubsections({
            1: aSubSection().withLines([
              aLine().withTexts([aText().withRawContent('SOLIDE').withCleanContent('solide').properties]).properties,
              aLineWithPhysicalStateIdentifierAndValue().properties,
            ]).properties,
          }).properties,
        ).properties,
        expected: CLEAN_PHYSICAL_STATE_VALUE,
      },
      {
        message: 'should use the rule by value if there is not matching text',
        fdsTree: aFdsTree().withSection9(
          aSection().withSubsections({
            1: aSubSection().withLines([aLine().withTexts([aText().withRawContent('SOLIDE').withCleanContent('solide').properties]).properties])
              .properties,
          }).properties,
        ).properties,
        expected: 'solide',
      },
    ])('$message', ({ fdsTree, expected }) => {
      expect(PhysicalStateRulesService.getPhysicalState(fdsTree)).toMatchObject(expected ? { value: expected } : expected);
    });
  });
});
