import _ from 'lodash';

import type { IFdsTree, ILine, IText, IXCounts } from '@topics/engine/model/fds.model.js';

export class FdsTreeCleanerService {
  public static readonly X_HIGHEST_ALIGNMENT_VALUE: number = 10;

  public static cleanFdsTree(fdsTree: IFdsTree, { xCounts, fromImage }: { xCounts: IXCounts; fromImage: boolean }): IFdsTree {
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
                          lines: this.cleanLines(subSection.lines, { xCounts, joinWithSpace }),
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
  }

  private static cleanLines(lines: ILine[], { xCounts, joinWithSpace }: { xCounts: IXCounts; joinWithSpace: boolean }): ILine[] {
    return _.map(lines, (line) => this.cleanLine(line, { xCounts, joinWithSpace }));
  }

  public static cleanLine(line: ILine, { xCounts, joinWithSpace }: { xCounts: IXCounts; joinWithSpace: boolean }): ILine {
    const valueToPass = this.computeXHighestAlignmentValue(this.X_HIGHEST_ALIGNMENT_VALUE, xCounts);
    return {
      ...line,
      texts: _.reduce(
        line.texts,
        (cleanedLine, text) => {
          if (_.isEmpty(cleanedLine)) return [text];

          if (xCounts[text.xPositionProportion] < valueToPass)
            return [
              ...cleanedLine.slice(0, cleanedLine.length - 1),
              { ..._.last(cleanedLine), content: `${_.last(cleanedLine).content}${joinWithSpace ? ' ' : ''}${text.content}` },
            ];

          return [...cleanedLine, text];
        },
        [] as IText[],
      ),
    };
  }

  private static computeXHighestAlignmentValue(x: number, xCounts: IXCounts): number {
    const values = Object.values(xCounts);
    const valueSorted = values.sort((a, b) => b - a);
    return valueSorted[x - 1];
  }
}
