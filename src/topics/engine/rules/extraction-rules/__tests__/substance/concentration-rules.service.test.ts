import type { SpyInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CONCENTRATION_VALUE } from '@topics/engine/__fixtures__/fixtures.constants.js';
import type { IConcentration, ILine, IStroke, IText } from '@topics/engine/model/fds.model.js';
import { ConcentrationRulesService } from '@topics/engine/rules/extraction-rules/substance/concentration-rules.service.js';
import { aText, aTextWithConcentration } from '@topics/engine/__fixtures__/text.mother.js';
import { TableExtractionService } from '@topics/engine/rules/extraction-rules/substance/table-extraction.service.js';

describe('ConcentrationRulesService tests', () => {
  describe('Regexps tests', () => {
    describe('RANGE_CONCENTRATION_REGEX tests', () => {
      it.each<{ input: string; expected: boolean }>([
        { input: '>30-<60', expected: true },
        { input: '>=30-<60', expected: true },
        { input: '≥30-<=60', expected: true },
        { input: '>30-<=60', expected: true },
        { input: '>30-≤60', expected: true },
        { input: '30-<60', expected: true },
        { input: '> 30-<60', expected: true },
        { input: '>30 -<60', expected: true },
        { input: '>30- <60', expected: true },
        { input: '>30-< 60', expected: true },
        { input: '>30.1234-<60', expected: true },
        { input: '>30,1234-<60', expected: true },
        { input: '>30-<60.1234', expected: true },
        { input: '>30-<60,1234', expected: true },
        { input: '30-60%', expected: true },
        { input: '30-60', expected: true },
        { input: '30 -60', expected: true },
        { input: '30- 60', expected: true },
        { input: '>30-60', expected: true },
        { input: '> 30-60', expected: true },
        { input: '<60', expected: true },
        { input: '>30', expected: true },
        { input: '>60%', expected: true },
        { input: '> 60%', expected: true },
        { input: '>60 %', expected: true },
        { input: '<100', expected: true },
        { input: '30<x<60', expected: true },
        { input: '30<x%<60', expected: true },
        { input: '30 <x%<60', expected: true },
        { input: '30< x%<60', expected: true },
        { input: '30<x %<60', expected: true },
        { input: '30<x% <60', expected: true },
        { input: '30<x%< 60', expected: true },
        { input: '30<=x<60', expected: true },
        { input: '30≤x<60', expected: true },
        { input: '30<x<=60', expected: true },
        { input: '30<x≤60', expected: true },

        { input: '1 30-60', expected: true },
        { input: '30-60 9', expected: true },
        { input: '-30-60', expected: false },
        { input: '- 30-60', expected: false },
        { input: '/30-60', expected: false },
        { input: '/ 30-60', expected: false },
        { input: '•30-60', expected: false },
        { input: '• 30-60', expected: false },
        { input: '30-60-', expected: false },
        { input: '30-60 -', expected: false },
        { input: '30-60/', expected: false },
        { input: '30-60 /', expected: false },
        { input: '30-60•', expected: false },
        { input: '30-60 •', expected: false },
        { input: '130-60', expected: false },
        { input: '30-609', expected: false },

        { input: '<456.23', expected: false },
        { input: '>101', expected: false },
        { input: '60', expected: false },
        { input: '100', expected: false },
        { input: 'abc', expected: false },
      ])('$input payload should return $expected', ({ input, expected }) => {
        expect(new RegExp(ConcentrationRulesService.CONCENTRATION_REGEX).test(input)).toEqual(expected);
      });
    });
  });

  describe('Concentration rules tests', () => {
    describe('getConcentrationsInColumn tests', () => {
      it.each<{ message: string; lines: IText[][]; expected: IConcentration[] }>([
        {
          message: 'should return an empty list when given an empty lines',
          lines: [],
          expected: [],
        },
        {
          message: 'should not return anything if no text has concentrations',
          lines: [[aText().properties], []],
          expected: [],
        },
        {
          message: 'should return a concentration if a line contains a concentration',
          lines: [[aTextWithConcentration().properties], []],
          expected: [CONCENTRATION_VALUE],
        },
        {
          message: 'should return a concentration if a text in a line contains a concentration',
          lines: [[aText().properties, aTextWithConcentration().properties], []],
          expected: [CONCENTRATION_VALUE],
        },
        {
          message: 'should return multiple concentration if multiple lines have a concentration even if it is the same',
          lines: [[aTextWithConcentration().properties], [aTextWithConcentration().properties]],
          expected: [CONCENTRATION_VALUE, CONCENTRATION_VALUE],
        },
      ])('$message', ({ lines, expected }) => {
        expect(ConcentrationRulesService.getConcentrationsInColumn(lines)).toEqual(expected);
      });
    });

    describe('getConcentrations tests', () => {
      let getTableVerticalStrokesSpy: SpyInstance<[strokes: IStroke[]], IStroke[]>;
      let splitLinesInColumnsSpy: SpyInstance<[line: ILine[], tableVerticalStrokes: IStroke[]], IText[][][]>;

      beforeEach(() => {
        getTableVerticalStrokesSpy = vi.spyOn(TableExtractionService, 'getTableVerticalStrokes');
        splitLinesInColumnsSpy = vi.spyOn(TableExtractionService, 'splitLinesInColumns');
      });

      afterEach(() => {
        getTableVerticalStrokesSpy.mockRestore();
        splitLinesInColumnsSpy.mockRestore();
      });

      it.each<{ message: string; linesSplittedByColumns: IText[][][]; expected: IConcentration[] }>([
        {
          message: 'should return an empty list when there is no text',
          linesSplittedByColumns: [[]],
          expected: [],
        },
        {
          message: 'should return concentrations of a column',
          linesSplittedByColumns: [[[aTextWithConcentration().properties]], [[]]],
          expected: [CONCENTRATION_VALUE],
        },
        {
          message: 'should return concentrations found in the column with most concentrations',
          linesSplittedByColumns: [
            [[aText().withContent('>10-60').properties]],
            [[aTextWithConcentration().properties], [aTextWithConcentration().properties]],
          ],
          expected: [CONCENTRATION_VALUE, CONCENTRATION_VALUE],
        },
      ])('$message', ({ linesSplittedByColumns, expected }) => {
        splitLinesInColumnsSpy.mockImplementation(() => linesSplittedByColumns);

        expect(ConcentrationRulesService.getConcentrations([], { strokes: [] })).toEqual(expected);
        expect(getTableVerticalStrokesSpy).toHaveBeenCalledOnce();
        expect(splitLinesInColumnsSpy).toHaveBeenCalledOnce();
      });
    });
  });
});
