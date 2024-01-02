import { describe, expect, it } from 'vitest';
import type { IExtractedDanger } from '@padoa/chemical-risk';

import type { IText } from '@topics/engine/model/fds.model.js';
import { aText, aTextWithEuhDanger, aTextWithHDanger, aTextWithPDanger } from '@topics/engine/__fixtures__/text.mother.js';
import { aDanger, aHDanger } from '@topics/engine/rules/extraction-rules/__tests__/__fixtures__/danger.mother.js';
import { SubstanceHazardsRulesService } from '@topics/engine/rules/extraction-rules/substance/substance-hazards-rules.service.js';

describe('SubstanceHazardsRulesService tests', () => {
  describe('getHazardsInColumn tests', () => {
    it.each<{ message: string; lines: IText[][]; expected: IExtractedDanger[] }>([
      {
        message: 'should return an empty list when given an empty lines',
        lines: [],
        expected: [],
      },
      {
        message: 'should not return anything if no text has dangers',
        lines: [[aText().properties], []],
        expected: [],
      },
      {
        message: 'should return a hazard if a line contains a hazard',
        lines: [[aTextWithHDanger().properties], []],
        expected: [aHDanger().properties],
      },
      {
        message: 'should not return a precaution if a line contains a precaution',
        lines: [[aTextWithPDanger().properties], []],
        expected: [],
      },
      {
        message: 'should not return an european hazard if a line contains an european hazard',
        lines: [[aTextWithEuhDanger().properties], []],
        expected: [],
      },
      {
        message: 'should return a hazard if a text in a line contains a hazard',
        lines: [[aText().properties, aTextWithHDanger().properties], []],
        expected: [aHDanger().properties],
      },
      {
        message: 'should return multiple hazards if multiple lines have a hazard',
        lines: [[aTextWithHDanger().properties], [aText().withContent('H300').properties]],
        expected: [aHDanger().properties, aDanger().withCode('H300').properties],
      },
      {
        message: 'should return multiple hazards if a text has multiple hazards',
        lines: [[aText().withContent('H300 and some other text H400').properties], []],
        expected: [aDanger().withCode('H300').properties, aDanger().withCode('H400').properties],
      },
      {
        message: 'should return multiple identical hazards if a hazard appears on multiple lines',
        lines: [[aTextWithHDanger().properties, aTextWithHDanger().properties], []],
        expected: [aHDanger().properties, aHDanger().properties],
      },
    ])('$message', ({ lines, expected }) => {
      expect(SubstanceHazardsRulesService.getHazardsInColumn(lines)).toEqual(expected);
    });
  });

  describe('getHazards tests', () => {
    it.each<{ message: string; linesSplittedByColumns: IText[][][]; expected: IExtractedDanger[] }>([
      {
        message: 'should return an empty list when there is no text',
        linesSplittedByColumns: [[]],
        expected: [],
      },
      {
        message: 'should return hazards of a column',
        linesSplittedByColumns: [[[aTextWithHDanger().properties]], [[]]],
        expected: [aHDanger().properties],
      },
      {
        message: 'should return hazards found in the column with multiple hazards',
        linesSplittedByColumns: [
          [[aText().withContent('H200').properties]],
          [[aTextWithHDanger().properties], [aText().withContent('H300').properties]],
        ],
        expected: [aHDanger().properties, aDanger().withCode('H300').properties],
      },
    ])('$message', ({ linesSplittedByColumns, expected }) => {
      expect(SubstanceHazardsRulesService.getHazards(linesSplittedByColumns)).toEqual(expected);
    });
  });
});
