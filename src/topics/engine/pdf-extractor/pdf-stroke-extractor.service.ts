import _ from 'lodash';

import type { IFill, IRawStroke, IPdfData, IStroke } from '@topics/engine/model/fds.model.js';

type IPageDimension = { height: number; width: number };
type IPageMetaData = IPageDimension & { pageNumber: number };

export class PdfStrokeExtractorService {
  public static getStrokesFromPdfData(pdfData: IPdfData): IStroke[] {
    return _(pdfData.Pages)
      .map((page, pageNumber) => {
        const pageMetaData = { height: page.Height, width: page.Width, pageNumber };
        return [
          ...this.getStrokeFromHLines(page.HLines, pageMetaData),
          ...this.getStrokeFromVLines(page.VLines, pageMetaData),
          ...this.getStrokeFromFills(page.Fills, pageMetaData),
        ];
      })
      .flatMap()
      .sortBy(['pageNumber', 'startBox.yPositionProportion', 'startBox.xPositionProportion'])
      .value();
  }

  public static getStrokeFromHLines(hLines: IRawStroke[], { height, width, pageNumber }: IPageMetaData): IStroke[] {
    return _(hLines)
      .filter((hLine) => hLine.w / height < 1 / 10 || hLine.l / width < 1 / 10)
      .map((hLine) => ({
        pageNumber,
        startBox: { xPositionProportion: hLine.x, yPositionProportion: hLine.y },
        endBox: { xPositionProportion: hLine.x + hLine.l, yPositionProportion: hLine.y + hLine.w },
      }))
      .map((stroke) => this.normalizeStroke(stroke, { height, width }))
      .value();
  }

  public static getStrokeFromVLines(vLines: IRawStroke[], { height, width, pageNumber }: IPageMetaData): IStroke[] {
    return _(vLines)
      .filter((vLine) => vLine.l / height < 1 / 10 || vLine.w / width < 1 / 10)
      .map((vLine) => ({
        pageNumber,
        startBox: { xPositionProportion: vLine.x, yPositionProportion: vLine.y },
        endBox: { xPositionProportion: vLine.x + vLine.w, yPositionProportion: vLine.y + vLine.l },
      }))
      .map((stroke) => this.normalizeStroke(stroke, { height, width }))
      .value();
  }

  public static getStrokeFromFills(fills: IFill[], { height, width, pageNumber }: IPageMetaData): IStroke[] {
    return _(fills)
      .filter((fill) => fill.h / height < 1 / 500 || fill.w / width < 1 / 500)
      .map((fill) => ({
        pageNumber,
        startBox: { xPositionProportion: fill.x, yPositionProportion: fill.y },
        endBox: { xPositionProportion: fill.x + fill.w, yPositionProportion: fill.y + fill.h },
      }))
      .map((stroke) => this.normalizeStroke(stroke, { height, width }))
      .value();
  }

  private static normalizeStroke(stroke: IStroke, { height, width }: IPageDimension): IStroke {
    return {
      pageNumber: stroke.pageNumber,
      startBox: {
        xPositionProportion: stroke.startBox.xPositionProportion / width,
        yPositionProportion: stroke.startBox.yPositionProportion / height,
      },
      endBox: { xPositionProportion: stroke.endBox.xPositionProportion / width, yPositionProportion: stroke.endBox.yPositionProportion / height },
    };
  }
}
