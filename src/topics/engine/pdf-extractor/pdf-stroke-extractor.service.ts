import _ from 'lodash';

import type { IFill, IRawStroke, IPdfData, IStroke } from '@topics/engine/model/fds.model.js';
import { FILL_MAX_WIDTH_IN_PROPORTION, RAW_STROKE_MAX_WIDTH_IN_PROPORTION } from '@topics/engine/pdf-extractor/pdf-stroke-extractor.config.js';

type IPageDimension = { height: number; width: number };
type IPageMetaData = IPageDimension & { pageNumber: number };

export class PdfStrokeExtractorService {
  public static getStrokesFromPdfData(pdfData: IPdfData): IStroke[] {
    return _(pdfData.Pages)
      .map((page, pageIndex) => {
        const pageMetaData = { height: page.Height, width: page.Width, pageNumber: pageIndex + 1 };
        return [
          ...PdfStrokeExtractorService.getStrokeFromHLines(page.HLines, pageMetaData),
          ...PdfStrokeExtractorService.getStrokeFromVLines(page.VLines, pageMetaData),
          ...PdfStrokeExtractorService.getStrokeFromFills(page.Fills, pageMetaData),
        ];
      })
      .flatMap()
      .sortBy(['startBox.pageNumber', 'startBox.yPositionProportion', 'startBox.xPositionProportion'])
      .value();
  }

  public static getStrokeFromHLines(hLines: IRawStroke[], { height, width, pageNumber }: IPageMetaData): IStroke[] {
    return _(hLines)
      .filter((hLine) => hLine.w / height <= RAW_STROKE_MAX_WIDTH_IN_PROPORTION)
      .map((hLine) => ({
        startBox: { pageNumber, xPositionProportion: hLine.x, yPositionProportion: hLine.y },
        endBox: { pageNumber, xPositionProportion: hLine.x + hLine.l, yPositionProportion: hLine.y + hLine.w },
      }))
      .map((stroke) => PdfStrokeExtractorService.normalizeStroke(stroke, { height, width }))
      .value();
  }

  public static getStrokeFromVLines(vLines: IRawStroke[], { height, width, pageNumber }: IPageMetaData): IStroke[] {
    return _(vLines)
      .filter((vLine) => vLine.w / width <= RAW_STROKE_MAX_WIDTH_IN_PROPORTION)
      .map((vLine) => ({
        startBox: { pageNumber, xPositionProportion: vLine.x, yPositionProportion: vLine.y },
        endBox: { pageNumber, xPositionProportion: vLine.x + vLine.w, yPositionProportion: vLine.y + vLine.l },
      }))
      .map((stroke) => PdfStrokeExtractorService.normalizeStroke(stroke, { height, width }))
      .value();
  }

  public static getStrokeFromFills(fills: IFill[], { height, width, pageNumber }: IPageMetaData): IStroke[] {
    return _(fills)
      .filter((fill) => fill.h / height <= FILL_MAX_WIDTH_IN_PROPORTION || fill.w / width <= FILL_MAX_WIDTH_IN_PROPORTION)
      .map((fill) => ({
        startBox: { pageNumber, xPositionProportion: fill.x, yPositionProportion: fill.y },
        endBox: { pageNumber, xPositionProportion: fill.x + fill.w, yPositionProportion: fill.y + fill.h },
      }))
      .map((stroke) => PdfStrokeExtractorService.normalizeStroke(stroke, { height, width }))
      .value();
  }

  private static normalizeStroke(stroke: IStroke, { height, width }: IPageDimension): IStroke {
    return {
      startBox: {
        pageNumber: stroke.startBox.pageNumber,
        xPositionProportion: stroke.startBox.xPositionProportion / width,
        yPositionProportion: stroke.startBox.yPositionProportion / height,
      },
      endBox: {
        pageNumber: stroke.startBox.pageNumber,
        xPositionProportion: stroke.endBox.xPositionProportion / width,
        yPositionProportion: stroke.endBox.yPositionProportion / height,
      },
    };
  }
}
