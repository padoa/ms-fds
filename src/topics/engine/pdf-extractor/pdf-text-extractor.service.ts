import _ from 'lodash';

import type { ILine, IPageDimension, IPdfData, IRawElement, IText } from '@topics/engine/model/fds.model.js';
import { TextCleanerService } from '@topics/engine/text-cleaner.service.js';

export class PdfTextExtractorService {
  public static isPdfParsable(pdfData: IPdfData): boolean {
    return !!pdfData.Pages.map(({ Texts }) => Texts)
      .flat()
      .map((obj) => {
        return obj.R;
      })
      .flat()
      .map((obj) => {
        return decodeURIComponent(obj.T);
      })
      .join('');
  }

  public static getTextFromPdfData(pdfData: IPdfData): ILine[] {
    const firstPage = _.first(pdfData.Pages);
    const pageDimension: IPageDimension = { width: _.get(firstPage, 'Width'), height: _.get(firstPage, 'Height') };

    const result = pdfData.Pages.map(({ Texts }, index) => _.map(Texts, (text) => ({ ...text, pageNumber: index + 1 })))
      .flat()
      .reduce(
        ({ lines, fullText: fullTextBeforeUpdate }: { lines: ILine[]; fullText: string }, rawLine) => {
          const rawText: string = rawLine.R.map(({ T }) => decodeURIComponent(T))
            .join('')
            .replaceAll('\t', ' ');
          const cleanText = TextCleanerService.cleanRawText(rawText);

          const fullText = `${fullTextBeforeUpdate}${rawText}`;
          const rawElement: IText = {
            pageNumber: rawLine.pageNumber,
            xPositionProportion: rawLine.x / pageDimension.width,
            yPositionProportion: rawLine.y / pageDimension.height,
            cleanContent: cleanText,
            rawContent: rawText,
          };

          for (const line of lines) {
            if (this.isSameLine(line, rawElement, { pageDimension, pageNumber: rawLine.pageNumber })) {
              line.texts.push(rawElement);
              return { lines, fullText };
            }
          }

          return {
            fullText,
            lines: [
              ...lines,
              {
                texts: [rawElement],
                startBox: {
                  pageNumber: rawLine.pageNumber,
                  xPositionProportion: rawElement.xPositionProportion,
                  yPositionProportion: rawElement.yPositionProportion,
                },
              },
            ],
          };
        },
        { lines: [], fullText: '' } as {
          lines: ILine[];
          fullText: string;
        },
      );

    const linesOrderedByPageAndY = _.sortBy(result.lines, ['startBox.pageNumber', 'startBox.yPositionProportion']);
    const linesOrdered = _.map(linesOrderedByPageAndY, (line) => ({ ...line, texts: _.sortBy(line.texts, 'xPositionProportion') }));
    return this.cleanLinesFromShadows(linesOrdered);
  }

  private static isSameLine(
    lastLine: ILine,
    rawLine: IRawElement,
    { pageNumber, pageDimension }: { pageNumber: number; pageDimension: IPageDimension },
  ): boolean {
    const { startBox } = lastLine;

    const TOLERANCE_IN_PERCENT = 0.25 / pageDimension.height;
    const yMinInPercent = rawLine.yPositionProportion - TOLERANCE_IN_PERCENT;
    const yMaxInPercent = rawLine.yPositionProportion + TOLERANCE_IN_PERCENT;
    const samePage = startBox?.pageNumber === pageNumber;

    return samePage && startBox.yPositionProportion >= yMinInPercent && startBox.yPositionProportion <= yMaxInPercent;
  }

  //----------------------------------------------------------------------------------------------
  //---------------------------------------- CLEANING -----------------------------------------------
  //----------------------------------------------------------------------------------------------

  private static cleanLinesFromShadows(lines: ILine[]): ILine[] {
    return _.map(lines, (line) => {
      const fullTextLine = line.texts.map(({ cleanContent }) => cleanContent).join('');
      if (this.areCharsDoubled(fullTextLine.replaceAll(' ', ''))) {
        const newContent = _.filter(fullTextLine, (text, index) => index % 2 === 0).join('');
        return { ...line, texts: [{ ...line.texts[0], cleanContent: newContent }] };
      }
      return line;
    });
  }

  private static areCharsDoubled(text: string): boolean {
    const evenCharText = _.filter(text, (char, index) => index % 2 === 0).join('');
    const oddCharText = _.filter(text, (char, index) => index % 2 === 1).join('');
    return evenCharText === oddCharText;
  }
}
