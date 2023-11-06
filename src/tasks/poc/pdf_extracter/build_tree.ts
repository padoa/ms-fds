import PDFParser from 'pdf2json';
import _ from 'lodash';

import { getTextFromImagePdf } from '@src/tasks/poc/pdf_extracter/pdf_image.js';

export type IBox = {
  x: number;
  y: number;
};

export type IFDSTree = {
  [section: number]: ISection;
};

type ISection = IBox & {
  subsections: {
    [subsection: number]: ISubsection;
  };
};

type ISubsection = IBox & { lines: ILine[] };

export type ILine = IBox & {
  texts: IText[];
};

export type IText = IBox & {
  content: string;
};

type IRawElement = IBox & {
  text?: string;
};

type IXCounts = { [xPosition: number]: number };

export const buildFDSTree = async (fdsFilePath: string): Promise<{ fdsTree: IFDSTree; xCounts: IXCounts; fullText: string; fromImage: boolean }> => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    pdfParser.on('pdfParser_dataReady', async (pdfData: IPdfData) => {
      let lines;
      const pdfIsParsable = isPdfParsable(pdfData);
      if (pdfIsParsable) {
        lines = orderElementsRawByRaw(pdfData);
      } else {
        const numberOfPages = pdfData.Pages.length;
        lines = await getTextFromImagePdf(fdsFilePath, { numberOfPagesToParse: numberOfPages });
      }
      const pdfContent = buildTree(lines);
      resolve({ ...pdfContent, fromImage: !pdfIsParsable });
    });
    pdfParser.on('pdfParser_dataError', (errData) => reject(errData));
    return pdfParser.loadPDF(fdsFilePath);
  });
};

type IPdfData = {
  Pages: Array<{
    Texts: Array<
      IBox & {
        R: Array<{ T: string }>;
      }
    >;
  }>;
};

const isPdfParsable = (pdfData: IPdfData): boolean => {
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

const orderElementsRawByRaw = (pdfData: IPdfData): ILine[] => {
  const result = pdfData.Pages.map(({ Texts }, index) => _.map(Texts, (text) => ({ ...text, y: text.y + index * 100 })))
    .flat()
    .reduce(
      ({ lines, fullText: fullTextBeforeUpdate }: { lines: ILine[]; fullText: string }, rawLine) => {
        const rawText: string = rawLine.R.map(({ T }) => decodeURIComponent(T).toLowerCase()).join('');
        const rawElement = { x: rawLine.x, y: rawLine.y, text: rawText };
        const fullText = `${fullTextBeforeUpdate}${rawText}`;

        for (const line of lines) {
          if (isSameLine(line, rawElement)) {
            line.texts.push({ x: rawElement.x, y: rawElement.y, content: rawElement.text });
            return { lines, fullText };
          }
        }

        return {
          fullText,
          lines: [
            ...lines,
            {
              x: rawElement.x,
              y: rawElement.y,
              texts: [{ x: rawElement.x, y: rawElement.y, content: rawElement.text }],
            },
          ],
        };
      },
      { lines: [], fullText: '' } as {
        lines: ILine[];
        fullText: string;
      },
    );

  const linesYOrdered = _.sortBy(result.lines, 'y');
  const linesOrdered = _.map(linesYOrdered, (line) => ({ ...line, texts: _.sortBy(line.texts, 'x') }));
  return linesOrdered;
};

const buildTree = (
  lines: ILine[],
): {
  fdsTree: IFDSTree;
  xCounts: IXCounts;
  fullText: string;
} => {
  return _.reduce(
    lines,
    (
      {
        fdsTree,
        currentSection,
        currentSubSection,
        xCounts: XCountsBeforeUpdate,
        fullText: fullTextBeforeUpdate,
      }: {
        fdsTree: IFDSTree;
        currentSection: number;
        currentSubSection: number;
        xCounts: IXCounts;
        fullText: string;
      },
      line,
    ) => {
      const xCounts = updateXCounts(XCountsBeforeUpdate, line);
      const fullTextLine = line.texts.map((t) => t.content).join('');
      const fullText = `${fullTextBeforeUpdate}${fullTextLine}`;

      const { interestingSection, sectionNumber: newSection } = isAnInterestingSection(fullTextLine, { currentSection });
      if (interestingSection) {
        return {
          fdsTree: addFDSTreeSection(fdsTree, { line, sectionNumber: newSection }),
          currentSection: newSection,
          currentSubSection: 0,
          xCounts,
          fullText,
        };
      }

      const { interestingSubSection, subSectionNumber: newSubSection } = isAnInterestingSubSection(fullTextLine, {
        currentSection,
        currentSubSection,
      });
      if (interestingSubSection) {
        return {
          fdsTree: addFDSTreeSubSection(fdsTree, {
            line,
            sectionNumber: currentSection,
            subSectionNumber: newSubSection,
          }),
          currentSection,
          currentSubSection: newSubSection,
          xCounts,
          fullText,
        };
      }

      if (isSwitchingSection(fullTextLine, { currentSection })) {
        return { fdsTree, currentSection: null, currentSubSection: null, xCounts, fullText };
      }

      if (isSwitchingSubSection(fullTextLine, { currentSection, currentSubSection })) {
        return { fdsTree, currentSection, currentSubSection: currentSubSection + 1, xCounts, fullText };
      }

      if (shouldAddLine(currentSection, currentSubSection)) {
        return {
          fdsTree: addFdsTreeLine(fdsTree, {
            line,
            sectionNumber: currentSection,
            subSectionNumber: currentSubSection,
          }),
          currentSection,
          currentSubSection,
          xCounts,
          fullText,
        };
      }

      return { fdsTree, currentSection, currentSubSection, xCounts, fullText };
    },
    { fdsTree: {}, currentSection: null, currentSubSection: null, xCounts: {}, fullText: '', currentLine: null } as {
      fdsTree: IFDSTree;
      currentSection: number;
      currentSubSection: number;
      xCounts: IXCounts;
      fullText: string;
    },
  );
};

//----------------------------------------------------------------------------------------------
//--------------------------------------- BUILDERS ---------------------------------------------
//----------------------------------------------------------------------------------------------

const addFDSTreeSection = (fdsTree: IFDSTree, { line, sectionNumber }: { line: ILine; sectionNumber: number }): IFDSTree => {
  return { ...fdsTree, [sectionNumber]: { x: line.x, y: line.y, subsections: {} as ISubsection } };
};

const addFDSTreeSubSection = (
  fdsTree: IFDSTree,
  { line, sectionNumber, subSectionNumber }: { line: ILine; sectionNumber: number; subSectionNumber: number },
): IFDSTree => {
  return {
    ...fdsTree,
    [sectionNumber]: {
      ...fdsTree[sectionNumber],
      subsections: {
        ...fdsTree[sectionNumber].subsections,
        [subSectionNumber]: {
          x: line.x,
          y: line.y,
          lines: [line],
        },
      },
    },
  };
};

const addFdsTreeLine = (
  fdsTree: IFDSTree,
  { line, sectionNumber, subSectionNumber }: { line: ILine; sectionNumber: number; subSectionNumber: number },
): IFDSTree => {
  const { lines } = fdsTree[sectionNumber].subsections[subSectionNumber];

  return {
    ...fdsTree,
    [sectionNumber]: {
      ...fdsTree[sectionNumber],
      subsections: {
        ...fdsTree[sectionNumber].subsections,
        [subSectionNumber]: {
          ...fdsTree[sectionNumber].subsections[subSectionNumber],
          lines: [...lines, line],
        },
      },
    },
  };
};

const updateXCounts = (xCounts: IXCounts, line: ILine): IXCounts => {
  return _.reduce(
    line.texts,
    (xCountsAcc, textElement) => {
      return updateXCountElement(xCountsAcc, textElement);
    },
    xCounts,
  );
};

const updateXCountElement = (xCounts: IXCounts, textElement: IText): IXCounts => {
  const actualCount = xCounts[textElement.x] || 0;
  return {
    ...xCounts,
    [textElement.x]: actualCount + 1,
  };
};

//----------------------------------------------------------------------------------------------
//-------------------------------------- CONDITIONS --------------------------------------------
//----------------------------------------------------------------------------------------------

const SECTIONS_TO_CONSIDER = {
  1: 'identification de la substance',
  2: 'identification des dangers',
  3: 'informations sur les composants',
} as { [key: number]: string };

const isAnInterestingSection = (
  text: string,
  { currentSection }: { currentSection: number },
): { interestingSection: boolean; sectionNumber: number } => {
  const textOfTheSectionToConsider = SECTIONS_TO_CONSIDER[(currentSection || 0) + 1];

  return {
    interestingSection: _.includes(text.replaceAll(' ', ''), textOfTheSectionToConsider?.replaceAll(' ', '')),
    sectionNumber: (currentSection || 0) + 1,
  };
};

const SUB_SECTIONS_TO_CONSIDER = {
  1: ['1', '3'],
  2: ['2'],
  3: ['1', '2'],
} as { [key: number]: string[] };

const isAnInterestingSubSection = (
  text: string,
  { currentSection, currentSubSection }: { currentSection: number; currentSubSection: number },
): { interestingSubSection: boolean; subSectionNumber?: number } => {
  if (!currentSection) return { interestingSubSection: false };

  const subSectionsToConsider = SUB_SECTIONS_TO_CONSIDER[currentSection];

  for (const subSection of subSectionsToConsider) {
    const subSectionNumber = Number(subSection);
    if (subSectionNumber <= currentSubSection) {
      continue;
    }

    if (
      _.includes(text, `${currentSection}.${subSectionNumber}`) ||
      _.includes(text, `${currentSection}. ${subSectionNumber}`) ||
      _.includes(text, `${currentSection},${subSectionNumber}`)
    )
      return { interestingSubSection: true, subSectionNumber };
  }

  return { interestingSubSection: false };
};

const isSwitchingSection = (text: string, { currentSection }: { currentSection: number }): boolean => {
  return currentSection === 3 && _.includes(text, `premiers secours`);
};

const isSwitchingSubSection = (
  text: string,
  { currentSection, currentSubSection }: { currentSection: number; currentSubSection: number },
): boolean => {
  return _.includes(text, `${currentSection}.${currentSubSection + 1}`) || _.includes(text, `${currentSection}. ${currentSubSection + 1}`);
};

const isSameLine = (lastLine: ILine, rawLine: IRawElement): boolean => {
  return lastLine?.y >= rawLine.y - 0.25 && lastLine?.y <= rawLine.y + 0.25;
};

const shouldAddLine = (currentSection: number, currentSubSection: number): boolean => {
  if (!currentSection || !currentSubSection) return false;
  const subSectionsToConsider = SUB_SECTIONS_TO_CONSIDER[currentSection];
  return _.includes(subSectionsToConsider, currentSubSection.toString());
};

//----------------------------------------------------------------------------------------------
//--------------------------------------- CLEANING ---------------------------------------------
//----------------------------------------------------------------------------------------------

export const cleanFDSTree = (fdsTree: IFDSTree, { xCounts, fromImage }: { xCounts: IXCounts; fromImage: boolean }): IFDSTree => {
  const joinWithSpace = fromImage;
  return _.reduce(
    fdsTree,
    (cleanedFdsTree, section, sectionNumber) => {
      return {
        ...cleanedFdsTree,
        [sectionNumber]: {
          ...section,
          subsections: _.reduce(
            section.subsections,
            (cleanedSection, subSection, subSectionNumber) => {
              return {
                ...cleanedSection,
                [subSectionNumber]: {
                  ...subSection,
                  lines: cleanLines(subSection.lines, { xCounts, joinWithSpace }),
                },
              };
            },
            {},
          ),
        },
      };
    },
    {},
  );
};

const cleanLines = (lines: ILine[], { xCounts, joinWithSpace }: { xCounts: IXCounts; joinWithSpace: boolean }): ILine[] => {
  return _.map(lines, (line) => cleanLine(line, { xCounts, joinWithSpace }));
};

const cleanLine = (line: ILine, { xCounts, joinWithSpace }: { xCounts: IXCounts; joinWithSpace: boolean }): ILine => {
  const valueToPass = xAlignmentValue(10, xCounts);
  return {
    ...line,
    texts: _.reduce(
      line.texts,
      (cleanedLine, text) => {
        if (_.isEmpty(cleanedLine)) return [text];

        if (xCounts[text.x] < valueToPass)
          return [
            ...cleanedLine.slice(0, cleanedLine.length - 1),
            { ..._.last(cleanedLine), content: `${_.last(cleanedLine).content}${joinWithSpace ? ' ' : ''}${text.content}` },
          ];

        return [...cleanedLine, text];
      },
      [] as IText[],
    ),
  };
};

// const xPercentile = (percentile: number, xCounts: IXCounts): number => {
//   const values = Object.values(xCounts);
//   const valueSorted = values.sort((a, b) => a - b);
//   return valueSorted[Math.floor((valueSorted.length / 100) * percentile)];
// };

const xAlignmentValue = (x: number, xCounts: IXCounts): number => {
  const values = Object.values(xCounts);
  const valueSorted = values.sort((a, b) => a - b);
  return valueSorted[valueSorted.length - x];
};
