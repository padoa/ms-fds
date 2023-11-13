import _ from 'lodash';

import type { IFDSTree, ILine, IText, IXCounts } from '@src/tasks/poc/fds.model.js';

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

//----------------------------------------------------------------------------------------------
//--------------------------------------- CLEANING ---------------------------------------------
//----------------------------------------------------------------------------------------------

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

const xAlignmentValue = (x: number, xCounts: IXCounts): number => {
  const values = Object.values(xCounts);
  const valueSorted = values.sort((a, b) => b - a);
  // console.log(Object.keys(xCounts).sort());
  // console.log(valueSorted);
  return valueSorted[x - 1];
};

// const xPercentile = (percentile: number, xCounts: IXCounts): number => {
//   const values = Object.values(xCounts);
//   const valueSorted = values.sort((a, b) => a - b);
//   return valueSorted[Math.floor((valueSorted.length / 100) * percentile)];
// };
