import { describe, expect, it } from 'vitest';

import type { IFill, IPdfData, IRawStroke, IStroke } from '@topics/engine/model/fds.model.js';
import { PdfStrokeExtractorService } from '@topics/engine/pdf-extractor/pdf-stroke-extractor.service.js';
import {
  aHorizontalRawStroke,
  aRawStroke,
  aRawStrokeTooWide,
  aVerticalRawStroke,
} from '@topics/engine/pdf-extractor/__tests__/__fixtures__/raw-stroke.mother.js';
import {
  PAGE_HEIGHT,
  PAGE_NUMBER,
  PAGE_WIDTH,
  POSITION_PROPORTION_X,
  POSITION_PROPORTION_Y,
} from '@topics/engine/__fixtures__/fixtures.constants.js';
import { aStroke, aStrokeEndingAtFillMaxWidth } from '@topics/engine/__fixtures__/stroke.mother.js';
import { aFill, aFillTooWide } from '@topics/engine/pdf-extractor/__tests__/__fixtures__/fill.mother.js';
import { aPosition } from '@topics/engine/__fixtures__/position.mother.js';
import { RAW_STROKE_MAX_WIDTH_IN_PROPORTION } from '@topics/engine/pdf-extractor/pdf-stroke-extractor.config.js';

describe('PdfStrokeExtractorService tests', () => {
  describe('getStrokeFromHLines tests', () => {
    it.each<{ message: string; hLines: IRawStroke[]; expected: IStroke[] }>([
      {
        message: 'should return an empty list if hLines is null',
        hLines: null,
        expected: [],
      },
      {
        message: 'should return an empty list if hLines is empty',
        hLines: [],
        expected: [],
      },
      {
        message: 'should return an empty list if all hLines are too wide',
        hLines: [aRawStrokeTooWide().build(), aRawStrokeTooWide().build()],
        expected: [],
      },
      {
        message: 'should return strokes that are not too wide',
        hLines: [aHorizontalRawStroke().build(), aRawStrokeTooWide().build()],
        expected: [aStroke().build()],
      },
    ])('$message', ({ hLines, expected }) => {
      expect(PdfStrokeExtractorService.getStrokeFromHLines(hLines, { width: PAGE_WIDTH, height: PAGE_HEIGHT, pageNumber: PAGE_NUMBER })).toEqual(
        expected,
      );
    });
  });

  describe('getStrokeFromVLines tests', () => {
    it.each<{ message: string; vLines: IRawStroke[]; expected: IStroke[] }>([
      {
        message: 'should return an empty list if vLines is null',
        vLines: null,
        expected: [],
      },
      {
        message: 'should return an empty list if vLines is empty',
        vLines: [],
        expected: [],
      },
      {
        message: 'should return an empty list if all vLines are too wide',
        vLines: [aRawStrokeTooWide().build(), aRawStrokeTooWide().build()],
        expected: [],
      },
      {
        message: 'should return strokes that are not too wide',
        vLines: [aVerticalRawStroke().build(), aRawStrokeTooWide().build()],
        expected: [aStroke().build()],
      },
    ])('$message', ({ vLines, expected }) => {
      expect(PdfStrokeExtractorService.getStrokeFromVLines(vLines, { width: PAGE_WIDTH, height: PAGE_HEIGHT, pageNumber: PAGE_NUMBER })).toEqual(
        expected,
      );
    });
  });

  describe('getStrokeFromFills tests', () => {
    it.each<{ message: string; fills: IFill[]; expected: IStroke[] }>([
      {
        message: 'should return an empty list if fills is null',
        fills: null,
        expected: [],
      },
      {
        message: 'should return an empty list if fills is empty',
        fills: [],
        expected: [],
      },
      {
        message: 'should return an empty list if all fills are too wide',
        fills: [aFillTooWide().build(), aFillTooWide().build()],
        expected: [],
      },
      {
        message: 'should return strokes that are not too wide or too long',
        fills: [aFill().build(), aFillTooWide().build(), aFillTooWide().build()],
        expected: [aStrokeEndingAtFillMaxWidth().build()],
      },
    ])('$message', ({ fills, expected }) => {
      expect(PdfStrokeExtractorService.getStrokeFromFills(fills, { width: PAGE_WIDTH, height: PAGE_HEIGHT, pageNumber: PAGE_NUMBER })).toEqual(
        expected,
      );
    });
  });

  describe('getStrokesFromPdfData tests', () => {
    const pageMetaData = { Width: PAGE_WIDTH, Height: PAGE_HEIGHT };

    it.each<{ message: string; pdfData: IPdfData; expected: IStroke[] }>([
      {
        message: 'should return an empty list if there is no pages',
        pdfData: { Pages: [] },
        expected: [],
      },
      {
        message: 'should return all strokes of pages',
        pdfData: {
          Pages: [
            {
              ...pageMetaData,
              HLines: [aHorizontalRawStroke().build()],
              VLines: [aVerticalRawStroke().build()],
              Fills: [aFill().build()],
              Texts: [],
            },
          ],
        },
        expected: [aStroke().build(), aStroke().build(), aStrokeEndingAtFillMaxWidth().build()],
      },
      {
        message: 'should return all strokes sortedByPage and by yPosition',
        pdfData: {
          Pages: [
            {
              ...pageMetaData,
              HLines: [
                aRawStroke()
                  .withX((POSITION_PROPORTION_X + 2 * RAW_STROKE_MAX_WIDTH_IN_PROPORTION) * PAGE_WIDTH)
                  .withY((POSITION_PROPORTION_Y + 2 * RAW_STROKE_MAX_WIDTH_IN_PROPORTION) * PAGE_HEIGHT)
                  .build(),
              ],
              VLines: [aVerticalRawStroke().build()],
              Fills: [],
              Texts: [],
            },
            {
              ...pageMetaData,
              HLines: [
                aRawStroke()
                  .withX((POSITION_PROPORTION_X + RAW_STROKE_MAX_WIDTH_IN_PROPORTION) * PAGE_WIDTH)
                  .withY((POSITION_PROPORTION_Y + RAW_STROKE_MAX_WIDTH_IN_PROPORTION) * PAGE_HEIGHT)
                  .build(),
              ],
              VLines: [],
              Fills: [],
              Texts: [],
            },
          ],
        },
        expected: [
          aStroke().build(),
          aStroke()
            .withStartBox(
              aPosition()
                .withXPositionProportion(POSITION_PROPORTION_X + 2 * RAW_STROKE_MAX_WIDTH_IN_PROPORTION)
                .withYPositionProportion(POSITION_PROPORTION_Y + 2 * RAW_STROKE_MAX_WIDTH_IN_PROPORTION),
            )
            .withEndBox(
              aPosition()
                .withXPositionProportion(POSITION_PROPORTION_X + 3 * RAW_STROKE_MAX_WIDTH_IN_PROPORTION)
                .withYPositionProportion(POSITION_PROPORTION_Y + 3 * RAW_STROKE_MAX_WIDTH_IN_PROPORTION),
            )
            .build(),
          aStroke()
            .withStartBox(
              aPosition()
                .withPageNumber(PAGE_NUMBER + 1)
                .withXPositionProportion(POSITION_PROPORTION_X + RAW_STROKE_MAX_WIDTH_IN_PROPORTION)
                .withYPositionProportion(POSITION_PROPORTION_Y + RAW_STROKE_MAX_WIDTH_IN_PROPORTION),
            )
            .withEndBox(
              aPosition()
                .withPageNumber(PAGE_NUMBER + 1)
                .withXPositionProportion(POSITION_PROPORTION_X + 2 * RAW_STROKE_MAX_WIDTH_IN_PROPORTION)
                .withYPositionProportion(POSITION_PROPORTION_Y + 2 * RAW_STROKE_MAX_WIDTH_IN_PROPORTION),
            )
            .build(),
        ],
      },
    ])('$message', ({ pdfData, expected }) => {
      expect(PdfStrokeExtractorService.getStrokesFromPdfData(pdfData)).toEqual(expected);
    });
  });
});
