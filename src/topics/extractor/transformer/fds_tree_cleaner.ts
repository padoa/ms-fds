import _ from 'lodash';

import type { IFDSTree, ILine, IText, IXCounts } from '@topics/extractor/model/fds.model.js';

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
          subsections:
            sectionNumber === '3'
              ? section.subsections
              : _.reduce(
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
  const valueToPass = computeXHighestAlignmentValue(10, xCounts);
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

const computeXHighestAlignmentValue = (x: number, xCounts: IXCounts): number => {
  const values = Object.values(xCounts);
  const valueSorted = values.sort((a, b) => b - a);
  return valueSorted[x - 1];
};
