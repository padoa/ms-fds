import type { SpyInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import _ from 'lodash';

import type { IExtractedConcentration, ILine, IStroke, IText } from '@topics/engine/model/fds.model.js';
import { ConcentrationRulesService } from '@topics/engine/rules/extraction-rules/substance/concentration-rules.service.js';
import { aText, aTextWithConcentration } from '@topics/engine/__fixtures__/text.mother.js';
import { TableExtractionService } from '@topics/engine/rules/extraction-rules/substance/table-extraction.service.js';
import { aConcentration } from '@topics/engine/rules/extraction-rules/__tests__/__fixtures__/concentration.mother.js';

describe('ConcentrationRulesService tests', () => {
  describe('Regexps tests', () => {
    describe('RANGE_CONCENTRATION_REGEX tests', () => {
      it.each<{ input: string; expected: string }>([
        { input: '>30-<60', expected: '>30-<60' },
        { input: '>=30-<60', expected: '>=30-<60' },
        { input: '≥30-<=60', expected: '≥30-<=60' },
        { input: '>30-<=60', expected: '>30-<=60' },
        { input: '>30-≤60', expected: '>30-≤60' },
        { input: '30-<60', expected: '30-<60' },
        { input: '> 30-<60', expected: '> 30-<60' },
        { input: '>30 -<60', expected: '>30 -<60' },
        { input: '>30- <60', expected: '>30- <60' },
        { input: '>30-< 60', expected: '>30-< 60' },
        { input: '>30.1234-<60', expected: '>30.1234-<60' },
        { input: '>30,1234-<60', expected: '>30,1234-<60' },
        { input: '>30-<60.1234', expected: '>30-<60.1234' },
        { input: '>30-<60,1234', expected: '>30-<60,1234' },
        { input: '1>30-<60', expected: '>30-<60' },
        { input: '30-60%', expected: '30-60%' },
        { input: '30-60', expected: '30-60' },
        { input: '30 -60', expected: '30 -60' },
        { input: '30- 60', expected: '30- 60' },
        { input: '>30-60', expected: '>30-60' },
        { input: '> 30-60', expected: '> 30-60' },
        { input: '<60', expected: '<60' },
        { input: '>30', expected: '>30' },
        { input: '>60%', expected: '>60%' },
        { input: '> 60%', expected: '> 60%' },
        { input: '>60 %', expected: '>60 %' },
        { input: '<100', expected: '<100' },
        { input: '30<x<60', expected: '30<x<60' },
        { input: '30<x%<60', expected: '30<x%<60' },
        { input: '30 <x%<60', expected: '30 <x%<60' },
        { input: '30< x%<60', expected: '30< x%<60' },
        { input: '30<x %<60', expected: '30<x %<60' },
        { input: '30<x% <60', expected: '30<x% <60' },
        { input: '30<x%< 60', expected: '30<x%< 60' },
        { input: '30<=x<60', expected: '30<=x<60' },
        { input: '30≤x<60', expected: '30≤x<60' },
        { input: '30<x<=60', expected: '30<x<=60' },
        { input: '30<x≤60', expected: '30<x≤60' },

        { input: '1 30-60', expected: '30-60' },
        { input: '30-60 9', expected: '30-60' },
        { input: '-30-60', expected: undefined },
        { input: '- 30-60', expected: undefined },
        { input: '/30-60', expected: undefined },
        { input: '/ 30-60', expected: undefined },
        { input: '•30-60', expected: undefined },
        { input: '• 30-60', expected: undefined },
        { input: '30-60-', expected: undefined },
        { input: '30-60 -', expected: undefined },
        { input: '30-60/', expected: undefined },
        { input: '30-60 /', expected: undefined },
        { input: '30-60•', expected: undefined },
        { input: '30-60 •', expected: undefined },
        { input: '130-60', expected: undefined },
        { input: '30-609', expected: undefined },

        { input: '<456.23', expected: undefined },
        { input: '>101', expected: undefined },
        { input: '60', expected: undefined },
        { input: '100', expected: undefined },
        { input: 'abc', expected: undefined },
      ])('$input payload should return $expected', ({ input, expected }) => {
        expect(_.first(input.match(new RegExp(ConcentrationRulesService.CONCENTRATION_REGEX)))).toEqual(expected);
      });
    });
  });

  describe('Concentration rules tests', () => {
    describe('getConcentrationsInColumn tests', () => {
      it.each<{ message: string; lines: IText[][]; expected: IExtractedConcentration[] }>([
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
          expected: [aConcentration().properties],
        },
        {
          message: 'should return a concentration if a text in a line contains a concentration',
          lines: [[aText().properties, aTextWithConcentration().properties], []],
          expected: [aConcentration().properties],
        },
        {
          message: 'should return multiple concentration if multiple lines have a concentration even if it is the same',
          lines: [[aTextWithConcentration().properties], [aTextWithConcentration().properties]],
          expected: [aConcentration().properties, aConcentration().properties],
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

      it.each<{ message: string; linesSplittedByColumns: IText[][][]; expected: IExtractedConcentration[] }>([
        {
          message: 'should return an empty list when there is no text',
          linesSplittedByColumns: [[]],
          expected: [],
        },
        {
          message: 'should return concentrations of a column',
          linesSplittedByColumns: [[[aTextWithConcentration().properties]], [[]]],
          expected: [aConcentration().properties],
        },
        {
          message: 'should return concentrations found in the column with most concentrations',
          linesSplittedByColumns: [
            [[aText().withContent('>10-60').properties]],
            [[aTextWithConcentration().properties], [aTextWithConcentration().properties]],
          ],
          expected: [aConcentration().properties, aConcentration().properties],
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
