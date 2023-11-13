import _ from 'lodash';
import { raw } from 'express';

import type { ILine, IPdfData, IRawElement, IRawLine, IText } from '@src/tasks/poc/fds.model.js';
import { Fonts, WIDTH_MAP } from '@src/tasks/poc/helpers/widthMap.js';

type ICharWidthsByStyle = {
  [styleId: string]: number[];
};

type IMeanCharWidthsByStyle = {
  [styleId: string]: number;
};

export const isPdfParsable = (pdfData: IPdfData): boolean => {
  const pdfContent = pdfData.Pages.map(({ Texts }) => Texts)
    .flat()
    .map((obj) => {
      return obj.R;
    })
    .flat()
    .map((obj) => {
      return decodeURIComponent(obj.T);
    })
    .join('');
  return !!pdfContent;
};

export const getTextFromPdfData = (pdfData: IPdfData): ILine[] => {
  const pdfDataMeanSpaceWidth = pdfData.Pages[0].Texts[0].sw;
  let pdfSpaceWidth;
  const result = pdfData.Pages.map(({ Texts }, index) => _.map(Texts, (text) => ({ ...text, y: text.y + index * 100 })))
    .flat()
    .reduce(
      (
        {
          lines,
          fullText: fullTextBeforeUpdate,
          charWidthsByStyle: charWidthsByStyleBeforeUpdate,
        }: { lines: ILine[]; fullText: string; charWidthsByStyle: ICharWidthsByStyle },
        rawLine,
      ) => {
        const rawText: string = rawLine.R.map(({ T }) => decodeURIComponent(T))
          .join('')
          .replaceAll('\t', ' ');

        if (rawText === ' ') {
          // console.log(rawLine.w);
          pdfSpaceWidth = rawLine.w;
        }
        // console.log(rawText);
        // .replaceAll('\t', ' ');

        const rawElement = { x: rawLine.x, y: rawLine.y, content: rawText, width: computeTextWidth(rawLine), styleId: rawLine.R[0].TS.toString() };
        // const rawElement = { x: rawLine.x, y: rawLine.y, content: rawText, width: computeTextWidth(rawLine, rawText) };
        const fullText = `${fullTextBeforeUpdate}${rawText}`;
        const charWidthsByStyle = updateCharWidthByStyle(charWidthsByStyleBeforeUpdate, rawLine, rawText);

        for (const line of lines) {
          if (isSameLine(line, rawElement)) {
            line.texts.push(rawElement);
            return { lines, fullText, charWidthsByStyle };
          }
        }

        return {
          fullText,
          charWidthsByStyle,
          lines: [
            ...lines,
            {
              x: rawElement.x,
              y: rawElement.y,
              texts: [rawElement],
            },
          ],
        };
      },
      { lines: [], fullText: '', charWidthsByStyle: {} } as {
        lines: ILine[];
        fullText: string;
        charWidthsByStyle: ICharWidthsByStyle;
      },
    );

  const linesYOrdered = _.sortBy(result.lines, 'y');
  const linesOrdered = _.map(linesYOrdered, (line) => ({ ...line, texts: _.sortBy(line.texts, 'x') }));
  // const meanCharWidthByStyle = computeMeanCharWidthByStyle(result.charWidthsByStyle);
  // const linesWithBlocsGrouped = groupBlocInLines(linesOrdered, { pdfSpaceWidth, meanCharWidthByStyle, pdfDataMeanSpaceWidth });
  const cleanedLines = cleanLines(linesOrdered);
  return cleanedLines;
};

const isSameLine = (lastLine: ILine, rawLine: IRawElement): boolean => {
  return lastLine?.y >= rawLine.y - 0.25 && lastLine?.y <= rawLine.y + 0.25;
};

//----------------------------------------------------------------------------------------------
//---------------------------------------- CLEANING -----------------------------------------------
//----------------------------------------------------------------------------------------------

const cleanLines = (lines: ILine[]): ILine[] => {
  const linesLowered = _.map(lines, (line) => ({ ...line, texts: _.map(line.texts, (text) => ({ ...text, content: text.content.toLowerCase() })) }));
  return cleanLinesFromShadows(linesLowered);
};

const cleanLinesFromShadows = (lines: ILine[]): ILine[] => {
  return _.map(lines, (line) => {
    const fullTextLine = line.texts.map(({ content }) => content).join('');
    // console.log(fullTextLine);
    if (areCharsDoubled(fullTextLine.replaceAll(' ', ''))) {
      const newContent = _.filter(fullTextLine, (text, index) => index % 2 === 0);
      return { ...line, texts: [{ ...line.texts[0], content: newContent }] };
    }
    return line;
  });
};

const areCharsDoubled = (text: string): boolean => {
  const evenCharText = _.filter(text, (char, index) => index % 2 === 0).join('');
  const oddCharText = _.filter(text, (char, index) => index % 2 === 1).join('');
  return evenCharText === oddCharText;
};

//----------------------------------------------------------------------------------------------
//---------------------------------------- FONTS -----------------------------------------------
//----------------------------------------------------------------------------------------------

const groupBlocInLines = (
  lines: ILine[],
  {
    pdfSpaceWidth,
    meanCharWidthByStyle,
    pdfDataMeanSpaceWidth,
  }: { pdfSpaceWidth: number; meanCharWidthByStyle: IMeanCharWidthsByStyle; pdfDataMeanSpaceWidth: number },
): ILine[] => {
  return _.map(lines, (line) => groupBlocInLine(line, { pdfSpaceWidth, meanCharWidthByStyle, pdfDataMeanSpaceWidth }));
};

const groupBlocInLine = (
  line: ILine,
  {
    pdfSpaceWidth,
    meanCharWidthByStyle,
    pdfDataMeanSpaceWidth,
  }: { pdfSpaceWidth: number; meanCharWidthByStyle: IMeanCharWidthsByStyle; pdfDataMeanSpaceWidth: number },
): ILine => {
  return {
    ...line,
    texts: _.reduce(
      line.texts,
      (textGrouped, text): IText[] => {
        if (!textGrouped.length) return [text];
        const lastText = _.last(textGrouped);
        const lastTextWidth = lastText.width;
        const distanceBetweenCurrentTextAndLastText = text.x - lastText.x;
        console.log(lastText, text, lastTextWidth, distanceBetweenCurrentTextAndLastText, pdfDataMeanSpaceWidth);

        if (lastTextWidth + pdfDataMeanSpaceWidth > distanceBetweenCurrentTextAndLastText) {
          const textMerged = mergeText(lastText, text);
          return [...textGrouped.slice(0, -1), textMerged];
        }
        textGrouped.push(text);
        return textGrouped;
      },
      [] as IText[],
    ),
  };
};

const updateCharWidthByStyle = (charWidthsByStyle: ICharWidthsByStyle, rawLine: IRawLine, rawText: string): ICharWidthsByStyle => {
  const styleId = rawLine.R[0].TS.toString();
  return {
    ...charWidthsByStyle,
    [styleId]: [...(charWidthsByStyle[styleId] || []), rawLine.w / rawText.length],
  };
};

const computeMeanCharWidthByStyle = (charWidthsByStyle: ICharWidthsByStyle): IMeanCharWidthsByStyle => {
  // console.log(JSON.stringify(charWidthsByStyle));
  return _.reduce(
    charWidthsByStyle,
    (meanCharWidthsByStyle, charWidths, styleId) => {
      return {
        ...meanCharWidthsByStyle,
        [styleId]: charWidths.sort((a, b) => a - b)[Math.round((charWidths.length * 3) / 4)],
      };
    },
    {},
  );
};

const FONT_ID_TO_FONTS = {
  0: Fonts.ARIAL,
  1: Fonts.ARIAL_NARROW,
  2: Fonts.ARIAL,
  3: Fonts.COURIER_NEW,
  4: Fonts.COURIER_NEW,
  5: Fonts.COURIER_NEW,
} as { [pdfFont: number]: Fonts };

const computeTextWidth = (rawLine: IRawLine): number => {
  // console.log(text.width, meanCharWidthByStyle[text.styleId], text.width / pdfSpaceWidth);
  // return (pdfDataMeanSpaceWidth * text.width) / pdfSpaceWidth;
  // const fontSize = text.
  const fontSize = rawLine.R[0].TS[1];
  // return rawLine.w;
  return (rawLine.w / fontSize) * (10 / 16);
};

// const computeTextWidth = (
//   text: IText,
//   {
//     pdfSpaceWidth,
//     meanCharWidthByStyle,
//     pdfDataMeanSpaceWidth,
//   }: { pdfSpaceWidth: number; meanCharWidthByStyle: IMeanCharWidthsByStyle; pdfDataMeanSpaceWidth: number },
// ): number => {
//   console.log(text.width, meanCharWidthByStyle[text.styleId], text.width / pdfSpaceWidth);
//   return (pdfDataMeanSpaceWidth * text.width) / pdfSpaceWidth;
// };

// const computeTextWidth = (rawLine: IRawLine, text: string): number => {
//   let textWidth = 0;

//   const [fontId, , bold, italic] = rawLine.R[0].TS;
//   console.log(rawLine.R[0], rawLine.w);

//   const fontWidths = WIDTH_MAP[FONT_ID_TO_FONTS[fontId]];
//   const spaceFontWidth = fontWidths[' '];

//   for (const char of text) {
//     const charWidth = fontWidths[char] || spaceFontWidth;
//     textWidth += charWidth;
//   }

//   if (bold) {
//     textWidth *= 1.25;
//   }

//   if (italic) {
//     textWidth *= 1.25;
//   }

//   const realTextWidth = (rawLine.sw * textWidth) / spaceFontWidth;

//   return realTextWidth;
// };

const mergeText = (firstText: IText, secondText: IText): IText => {
  return {
    ...firstText,
    width: secondText.x - firstText.x + secondText.width,
    // width: secondText.x - firstText.x + secondText.width,
    content: firstText.content + secondText.content,
  };
};
