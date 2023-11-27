import _ from 'lodash';

import type { ILine, IPdfData, IRawElement } from '@topics/engine/model/fds.model.js';
import type { IExtractorResult } from '@topics/engine/pdf-extractor/pdf-extractor.model.js';

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

  public static getTextAndDimensionFromPdfData(pdfData: IPdfData): IExtractorResult {
    const result = pdfData.Pages.map(({ Texts }, index) => _.map(Texts, (text) => ({ ...text, y: text.y + index * 100, pageNumber: index + 1 })))
      .flat()
      .reduce(
        ({ lines, fullText: fullTextBeforeUpdate }: { lines: ILine[]; fullText: string }, rawLine) => {
          const rawText: string = rawLine.R.map(({ T }) => decodeURIComponent(T).toLowerCase())
            .join('')
            .replaceAll('\t', ' ');

          const rawElement = { x: rawLine.x, y: rawLine.y, content: rawText };
          const fullText = `${fullTextBeforeUpdate}${rawText}`;

          for (const line of lines) {
            if (this.isSameLine(line, rawElement)) {
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
                pageNumber: rawLine.pageNumber,
                startBox: {
                  x: rawElement.x,
                  y: rawElement.y,
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

    const linesYOrdered = _.sortBy(result.lines, 'y'); // TODO: sort by pageNumber and 'y' instead of 'y' and adding index *100
    const linesOrdered = _.map(linesYOrdered, (line) => ({ ...line, texts: _.sortBy(line.texts, 'x') }));
    const cleanedLines = this.cleanLines(linesOrdered);
    const fistPage = _.first(pdfData.Pages);
    const pageDimension = { width: _.get(fistPage, 'Width'), height: _.get(fistPage, 'Height') };

    return { lines: cleanedLines, pageDimension };
  }

  private static isSameLine(lastLine: ILine, rawLine: IRawElement): boolean {
    return lastLine?.startBox.y >= rawLine.y - 0.25 && lastLine?.startBox.y <= rawLine.y + 0.25;
  }

  //----------------------------------------------------------------------------------------------
  //---------------------------------------- CLEANING -----------------------------------------------
  //----------------------------------------------------------------------------------------------

  private static cleanLines(lines: ILine[]): ILine[] {
    const linesLowered = _.map(lines, (line) => ({
      ...line,
      texts: _.map(line.texts, (text) => ({ ...text, content: text.content.toLowerCase() })),
    }));
    return this.cleanLinesFromShadows(linesLowered);
  }

  private static cleanLinesFromShadows(lines: ILine[]): ILine[] {
    return _.map(lines, (line) => {
      const fullTextLine = line.texts.map(({ content }) => content).join('');
      if (this.areCharsDoubled(fullTextLine.replaceAll(' ', ''))) {
        const newContent = _.filter(fullTextLine, (text, index) => index % 2 === 0).join('');
        return { ...line, texts: [{ ...line.texts[0], content: newContent }] };
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
