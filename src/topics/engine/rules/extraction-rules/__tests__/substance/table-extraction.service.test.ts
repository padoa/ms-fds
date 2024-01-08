import type { SpyInstance } from 'vitest';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

import type { ILine, IStroke, IText } from '@topics/engine/model/fds.model.js';
import { aHorizontalStroke, aStroke, aVerticalStroke } from '@topics/engine/__fixtures__/stroke.mother.js';
import { TableExtractionService } from '@topics/engine/rules/extraction-rules/substance/table-extraction.service.js';
import { aPosition, aPositionWithXIncremented } from '@topics/engine/__fixtures__/position.mother.js';
import { PAGE_NUMBER, POSITION_PROPORTION_X, POSITION_PROPORTION_Y } from '@topics/engine/__fixtures__/fixtures.constants.js';
import { aLine, aLineWithOneText } from '@topics/engine/__fixtures__/line.mother.js';
import { aText, aTextWithRandomContent1, aTextWithRandomContent2, aTextWithRandomContent3 } from '@topics/engine/__fixtures__/text.mother.js';

describe('TableExtractionService tests', () => {
  describe('Vertical stroke tests', () => {
    describe('mergeStrokesVerticallyAligned tests', () => {
      it.each<{ message: string; strokes: IStroke[]; expected: IStroke[] }>([
        {
          message: 'should return the given stroke if there is only one stroke',
          strokes: [aStroke().build()],
          expected: [aStroke().build()],
        },
        {
          message: 'should return all the strokes if they are not on the same x position',
          strokes: [aStroke().build(), aStroke().withStartBox(aPositionWithXIncremented()).build()],
          expected: [aStroke().build(), aStroke().withStartBox(aPositionWithXIncremented()).build()],
        },
        {
          message: 'should return only a stroke if they are on the same x position',
          strokes: [aStroke().build(), aStroke().withEndBox(aPosition().withYPositionProportion(0.5)).build()],
          expected: [aStroke().withEndBox(aPosition().withYPositionProportion(0.5)).build()],
        },
        {
          message: 'should return all strokes if they are on the same x position but on another page',
          strokes: [
            aStroke().build(),
            aStroke()
              .withStartBox(aPosition().withPageNumber(PAGE_NUMBER + 1))
              .build(),
          ],
          expected: [
            aStroke().build(),
            aStroke()
              .withStartBox(aPosition().withPageNumber(PAGE_NUMBER + 1))
              .build(),
          ],
        },
      ])('$message', ({ strokes, expected }) => {
        expect(TableExtractionService.mergeStrokesVerticallyAligned(strokes)).toEqual(expected);
      });
    });

    describe('filterVerticalStrokes tests', () => {
      it.each<{ message: string; strokes: IStroke[]; expected: IStroke[] }>([
        {
          message: 'should return the given stroke if it is a vertical stroke',
          strokes: [aVerticalStroke().build()],
          expected: [aVerticalStroke().build()],
        },
        {
          message: 'should not return horizontal strokes',
          strokes: [aHorizontalStroke().build()],
          expected: [],
        },
        {
          message: 'should filter horizontal strokes',
          strokes: [aVerticalStroke().build(), aHorizontalStroke().build()],
          expected: [aVerticalStroke().build()],
        },
      ])('$message', ({ strokes, expected }) => {
        expect(TableExtractionService.filterVerticalStrokes(strokes)).toEqual(expected);
      });
    });

    describe('filterCloseVerticalStrokes tests', () => {
      it.each<{ message: string; strokes: IStroke[]; expected: IStroke[] }>([
        {
          message: 'should return an empty list if there is no strokes',
          strokes: [],
          expected: [],
        },
        {
          message: 'should return the given stroke if there is only a stroke',
          strokes: [aVerticalStroke().build()],
          expected: [aVerticalStroke().build()],
        },
        {
          message: 'should deduplicate strokes if they are too close',
          strokes: [
            aVerticalStroke().build(),
            aVerticalStroke()
              .withStartBox(aPosition().withXPositionProportion(POSITION_PROPORTION_X + TableExtractionService.CLOSE_VERTICAL_STROKE / 2))
              .build(),
          ],
          expected: [aVerticalStroke().build()],
        },
        {
          message: 'should not deduplicate strokes if they are far enough',
          strokes: [
            aVerticalStroke().build(),
            aVerticalStroke()
              .withStartBox(aPosition().withXPositionProportion(POSITION_PROPORTION_X + TableExtractionService.CLOSE_VERTICAL_STROKE))
              .build(),
          ],
          expected: [
            aVerticalStroke().build(),
            aVerticalStroke()
              .withStartBox(aPosition().withXPositionProportion(POSITION_PROPORTION_X + TableExtractionService.CLOSE_VERTICAL_STROKE))
              .build(),
          ],
        },
      ])('$message', ({ strokes, expected }) => {
        expect(TableExtractionService.filterCloseVerticalStrokes(strokes)).toEqual(expected);
      });
    });

    describe('getTableVerticalStrokes tests', () => {
      let mergeStrokesVerticallyAlignedSpy: SpyInstance<[strokes: IStroke[]], IStroke[]>;
      let filterVerticalStrokesSpy: SpyInstance<[strokes: IStroke[]], IStroke[]>;
      let filterCloseVerticalStrokesSpy: SpyInstance<[strokes: IStroke[]], IStroke[]>;

      beforeEach(() => {
        mergeStrokesVerticallyAlignedSpy = vi.spyOn(TableExtractionService, 'mergeStrokesVerticallyAligned');
        filterVerticalStrokesSpy = vi.spyOn(TableExtractionService, 'filterVerticalStrokes');
        filterCloseVerticalStrokesSpy = vi.spyOn(TableExtractionService, 'filterCloseVerticalStrokes');
      });

      afterEach(() => {
        mergeStrokesVerticallyAlignedSpy.mockRestore();
        filterVerticalStrokesSpy.mockRestore();
        filterCloseVerticalStrokesSpy.mockRestore();
      });

      it('should return an empty list if there is no strokes', () => {
        expect(TableExtractionService.getTableVerticalStrokes([])).toEqual([]);
        expect(mergeStrokesVerticallyAlignedSpy).not.toHaveBeenCalled();
        expect(filterVerticalStrokesSpy).not.toHaveBeenCalled();
        expect(filterCloseVerticalStrokesSpy).not.toHaveBeenCalled();
      });

      it.each<{ message: string; strokes: IStroke[]; expected: IStroke[] }>([
        {
          message: 'should return table vertical strokes',
          strokes: [
            aVerticalStroke().build(),
            aVerticalStroke()
              .withStartBox(aPosition().withXPositionProportion(POSITION_PROPORTION_X + 0.1))
              .withEndBox(
                aPosition()
                  .withXPositionProportion(POSITION_PROPORTION_X + 0.1)
                  .withYPositionProportion(POSITION_PROPORTION_Y + 0.1),
              )
              .build(),
            aVerticalStroke()
              .withStartBox(aPosition().withXPositionProportion(POSITION_PROPORTION_X + 2 * 0.1))
              .withEndBox(
                aPosition()
                  .withXPositionProportion(POSITION_PROPORTION_X + 2 * 0.1)
                  .withYPositionProportion(POSITION_PROPORTION_Y + 0.1),
              )
              .build(),
          ],
          expected: [
            aVerticalStroke().build(),
            aVerticalStroke()
              .withStartBox(aPosition().withXPositionProportion(POSITION_PROPORTION_X + 0.1))
              .withEndBox(
                aPosition()
                  .withXPositionProportion(POSITION_PROPORTION_X + 0.1)
                  .withYPositionProportion(POSITION_PROPORTION_Y + 0.1),
              )
              .build(),
            aVerticalStroke()
              .withStartBox(aPosition().withXPositionProportion(POSITION_PROPORTION_X + 2 * 0.1))
              .withEndBox(
                aPosition()
                  .withXPositionProportion(POSITION_PROPORTION_X + 2 * 0.1)
                  .withYPositionProportion(POSITION_PROPORTION_Y + 0.1),
              )
              .build(),
          ],
        },
        {
          message: 'should return table vertical strokes sorted by x',
          strokes: [
            aVerticalStroke()
              .withStartBox(aPosition().withXPositionProportion(POSITION_PROPORTION_X + 2 * 0.1))
              .withEndBox(
                aPosition()
                  .withXPositionProportion(POSITION_PROPORTION_X + 2 * 0.1)
                  .withYPositionProportion(POSITION_PROPORTION_Y + 0.1),
              )
              .build(),
            aVerticalStroke()
              .withStartBox(aPosition().withXPositionProportion(POSITION_PROPORTION_X + 0.1))
              .withEndBox(
                aPosition()
                  .withXPositionProportion(POSITION_PROPORTION_X + 0.1)
                  .withYPositionProportion(POSITION_PROPORTION_Y + 0.1),
              )
              .build(),
            aVerticalStroke().build(),
          ],
          expected: [
            aVerticalStroke().build(),
            aVerticalStroke()
              .withStartBox(aPosition().withXPositionProportion(POSITION_PROPORTION_X + 0.1))
              .withEndBox(
                aPosition()
                  .withXPositionProportion(POSITION_PROPORTION_X + 0.1)
                  .withYPositionProportion(POSITION_PROPORTION_Y + 0.1),
              )
              .build(),
            aVerticalStroke()
              .withStartBox(aPosition().withXPositionProportion(POSITION_PROPORTION_X + 2 * 0.1))
              .withEndBox(
                aPosition()
                  .withXPositionProportion(POSITION_PROPORTION_X + 2 * 0.1)
                  .withYPositionProportion(POSITION_PROPORTION_Y + 0.1),
              )
              .build(),
          ],
        },
        {
          message: 'should not return table vertical strokes if there is less than 2 column',
          strokes: [aVerticalStroke().build()],
          expected: [],
        },
      ])('$message', ({ strokes, expected }) => {
        expect(TableExtractionService.getTableVerticalStrokes(strokes)).toEqual(expected);
        expect(mergeStrokesVerticallyAlignedSpy).toHaveBeenCalledOnce();
        expect(mergeStrokesVerticallyAlignedSpy).toHaveBeenCalledWith(strokes);
        expect(filterVerticalStrokesSpy).toHaveBeenCalledOnce();
        expect(filterCloseVerticalStrokesSpy).toHaveBeenCalledOnce();
      });
    });
  });

  describe('Split lines in columns tests', () => {
    describe('splitLineInColumn tests', () => {
      it.each<{ message: string; line: ILine; tableVerticalStrokes: IStroke[]; expected: IText[][] }>([
        {
          message: 'should return the text before the first stroke',
          line: aLineWithOneText().build(),
          tableVerticalStrokes: [aStroke().withStartBox(aPosition().withXPositionProportion(0.5)).build()],
          expected: [[aText().build()], []],
        },
        {
          message: 'should return the text after the first stroke',
          line: aLine()
            .withTexts([aText().withXPositionProportion(1)])
            .build(),
          tableVerticalStrokes: [aStroke().withStartBox(aPosition().withXPositionProportion(0.5)).build()],
          expected: [[], [aText().withXPositionProportion(1).build()]],
        },
        {
          message: 'should split the text between the strokes',
          line: aLine()
            .withTexts([aText(), aText().withXPositionProportion(1)])
            .build(),
          tableVerticalStrokes: [aStroke().withStartBox(aPosition().withXPositionProportion(0.5)).build()],
          expected: [[aText().build()], [aText().withXPositionProportion(1).build()]],
        },
        {
          message: 'should consider that the text is in the second half if the text starts slightly before the stroke',
          line: aLine()
            .withTexts([
              aText().withXPositionProportion(0.5 - 2 * TableExtractionService.COLUMN_ASSIGNMENT_TOLERANCE),
              aText().withXPositionProportion(0.5 - TableExtractionService.COLUMN_ASSIGNMENT_TOLERANCE),
            ])
            .build(),
          tableVerticalStrokes: [aStroke().withStartBox(aPosition().withXPositionProportion(0.5)).build()],
          expected: [
            [
              aText()
                .withXPositionProportion(0.5 - 2 * TableExtractionService.COLUMN_ASSIGNMENT_TOLERANCE)
                .build(),
            ],
            [
              aText()
                .withXPositionProportion(0.5 - TableExtractionService.COLUMN_ASSIGNMENT_TOLERANCE)
                .build(),
            ],
          ],
        },
      ])('$message', ({ line, tableVerticalStrokes, expected }) => {
        expect(TableExtractionService.splitLineInColumn(line, tableVerticalStrokes)).toEqual(expected);
      });
    });

    describe('splitLinesInColumns tests', () => {
      let splitLineInColumnSpy: SpyInstance<[line: ILine, tableVerticalStrokes: IStroke[]], IText[][]>;
      const tableVerticalStrokes = [
        aStroke().withStartBox(aPosition().withXPositionProportion(0.25)).build(),
        aStroke().withStartBox(aPosition().withXPositionProportion(0.5)).build(),
        aStroke().withStartBox(aPosition().withXPositionProportion(0.75)).build(),
      ];

      beforeEach(() => {
        splitLineInColumnSpy = vi
          .spyOn(TableExtractionService, 'splitLineInColumn')
          .mockImplementation(() => [
            [aTextWithRandomContent1().build()],
            [],
            [aTextWithRandomContent2().build()],
            [aTextWithRandomContent3().build()],
          ]);
      });

      afterEach(() => {
        splitLineInColumnSpy.mockRestore();
      });

      it('should return the text in lines if there is no table vertical strokes', () => {
        expect(TableExtractionService.splitLinesInColumns([aLineWithOneText().build()], [])).toEqual([[[aText().build()]]]);
      });

      it('should correctly assign text to columns', () => {
        const expected = [[[aTextWithRandomContent1().build()]], [[]], [[aTextWithRandomContent2().build()]], [[aTextWithRandomContent3().build()]]];

        expect(TableExtractionService.splitLinesInColumns([aLine().build()], tableVerticalStrokes)).toEqual(expected);
      });

      it('should correctly assign lines to columns', () => {
        const expected = [
          [[aTextWithRandomContent1().build()], [aTextWithRandomContent1().build()]],
          [[], []],
          [[aTextWithRandomContent2().build()], [aTextWithRandomContent2().build()]],
          [[aTextWithRandomContent3().build()], [aTextWithRandomContent3().build()]],
        ];

        expect(TableExtractionService.splitLinesInColumns([aLine().build(), aLine().build()], tableVerticalStrokes)).toEqual(expected);
      });
    });
  });
});
