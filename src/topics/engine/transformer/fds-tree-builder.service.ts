import _ from 'lodash';

import type { IBox, IFdsTree, ILine, IPosition, IStroke, ISubsection, IXCounts } from '@topics/engine/model/fds.model.js';
import { SectionRulesService } from '@topics/engine/rules/section-rules.service.js';
import type { IBuildTree, IFdsTreeResult } from '@topics/engine/transformer/fds-tree-builder.model.js';

type IFdsTreeWithoutStrokes = {
  [section: number]: IBox & {
    subsections: {
      [subsection: number]: Omit<ISubsection, 'strokes'> & { strokes?: IStroke[] };
    };
  };
};

export class FDSTreeBuilderService {
  public static buildFdsTree({ lines, strokes }: { lines: ILine[]; strokes: IStroke[] }): IFdsTreeResult {
    const { fdsTree: fdsTreeWithoutStrokes, fullText, xCounts } = FDSTreeBuilderService.buildFdsTreeWithoutStrokes(lines);
    const fdsTree = this.addStrokesToFdsTreeInPlace(fdsTreeWithoutStrokes, { strokes });
    return { fdsTree, fullText, xCounts };
  }

  private static buildFdsTreeWithoutStrokes(lines: ILine[]): { fdsTree: IFdsTreeWithoutStrokes } & Omit<IFdsTreeResult, 'fdsTree'> {
    const result = _.reduce(
      lines,
      ({ fdsTree, currentSection, currentSubSection, xCounts: XCountsBeforeUpdate, fullText: fullTextBeforeUpdate }: IBuildTree, line) => {
        const xCounts = this.updateXCounts(XCountsBeforeUpdate, line);
        const fullTextLine = line.texts.map((t) => t.content).join('');
        const fullText = `${fullTextBeforeUpdate}${fullTextLine}`;

        // SECTION
        const newSection = SectionRulesService.computeNewSection(fullTextLine, { currentSection });
        const sectionChanged = newSection !== currentSection;
        if (sectionChanged) {
          let newFdsTree = this.setFdsTreeEndBoxSection(fdsTree, { position: line.startBox, sectionNumber: currentSection });
          if (SectionRulesService.isAnInterestingSection(newSection)) {
            newFdsTree = this.addFdsTreeSection(fdsTree, { line, sectionNumber: newSection });
          }

          return { fdsTree: newFdsTree, currentSection: newSection, currentSubSection: 0, xCounts, fullText };
        }

        // SUBSECTION
        const newSubSection = SectionRulesService.computeNewSubSection(fullTextLine, { currentSection, currentSubSection });
        const subSectionChanged = newSubSection !== currentSubSection;
        if (subSectionChanged) {
          let newFdsTree = this.setFdsTreeEndBoxSubSection(fdsTree, {
            position: line.startBox,
            sectionNumber: currentSection,
            subSectionNumber: currentSubSection,
          });
          if (SectionRulesService.isAnInterestingSubSection(currentSection, newSubSection)) {
            newFdsTree = this.addFdsTreeSubSection(fdsTree, {
              line,
              sectionNumber: currentSection,
              subSectionNumber: newSubSection,
            });
          }

          return { fdsTree: newFdsTree, currentSection, currentSubSection: newSubSection, xCounts, fullText };
        }

        // LINE
        if (SectionRulesService.shouldAddLineInSubSection(currentSection, currentSubSection)) {
          return {
            fdsTree: FDSTreeBuilderService.addFdsTreeLine(fdsTree, {
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
      { fdsTree: {}, currentSection: null, currentSubSection: null, xCounts: {}, fullText: '' },
    );

    return {
      fdsTree: result.fdsTree,
      fullText: result.fullText,
      xCounts: result.xCounts,
    };
  }

  private static addStrokesToFdsTreeInPlace(fdsTree: IFdsTreeWithoutStrokes, { strokes }: { strokes: IStroke[] }): IFdsTree {
    _.forEach(fdsTree, (section, sectionNumber) => {
      _.forEach(section.subsections, (subSection, subSectionNumber) => {
        // eslint-disable-next-line no-param-reassign
        fdsTree[+sectionNumber].subsections[+subSectionNumber].strokes = _.filter(
          strokes,
          ({ startBox, endBox }) =>
            startBox.yPositionProportion <= subSection.startBox.yPositionProportion &&
            (!subSection.endBox || endBox.yPositionProportion > subSection.endBox.yPositionProportion),
        );
      });
    });

    return fdsTree as IFdsTree;
  }

  //----------------------------------------------------------------------------------------------
  //--------------------------------------- BUILDERS ---------------------------------------------
  //----------------------------------------------------------------------------------------------

  public static addFdsTreeSection(
    fdsTree: IFdsTreeWithoutStrokes,
    { line, sectionNumber }: { line: ILine; sectionNumber: number },
  ): IFdsTreeWithoutStrokes {
    return {
      ...fdsTree,
      [sectionNumber]: {
        startBox: {
          xPositionProportion: line.startBox.xPositionProportion,
          yPositionProportion: line.startBox.yPositionProportion,
        },
        subsections: {} as ISubsection,
      },
    };
  }

  public static setFdsTreeEndBoxSection(
    fdsTree: IFdsTreeWithoutStrokes,
    { position, sectionNumber }: { position: IPosition; sectionNumber: number },
  ): IFdsTreeWithoutStrokes {
    if (fdsTree[sectionNumber]) fdsTree[sectionNumber].endBox = position; // eslint-disable-line no-param-reassign
    return fdsTree;
  }

  public static addFdsTreeSubSection(
    fdsTree: IFdsTreeWithoutStrokes,
    { line, sectionNumber, subSectionNumber }: { line: ILine; sectionNumber: number; subSectionNumber: number },
  ): IFdsTreeWithoutStrokes {
    return {
      ...fdsTree,
      [sectionNumber]: {
        ...fdsTree[sectionNumber],
        subsections: {
          ...fdsTree[sectionNumber].subsections,
          [subSectionNumber]: {
            startBox: {
              xPositionProportion: line.startBox.xPositionProportion,
              yPositionProportion: line.startBox.yPositionProportion,
            },
            lines: [line],
          },
        },
      },
    };
  }

  public static setFdsTreeEndBoxSubSection(
    fdsTree: IFdsTreeWithoutStrokes,
    { position, sectionNumber, subSectionNumber }: { position: IPosition; sectionNumber: number; subSectionNumber: number },
  ): IFdsTreeWithoutStrokes {
    if (fdsTree[sectionNumber]?.subsections[subSectionNumber]) fdsTree[sectionNumber].subsections[subSectionNumber].endBox = position; // eslint-disable-line no-param-reassign
    return fdsTree;
  }

  public static addFdsTreeLine(
    fdsTree: IFdsTreeWithoutStrokes,
    { line, sectionNumber, subSectionNumber }: { line: ILine; sectionNumber: number; subSectionNumber: number },
  ): IFdsTreeWithoutStrokes {
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
  }

  public static updateXCounts(xCounts: IXCounts, line: ILine): IXCounts {
    return _.reduce(
      line.texts,
      (xCountsAcc, textElement) => {
        const actualCount = xCountsAcc[textElement.xPositionProportion] || 0;
        // eslint-disable-next-line no-param-reassign
        xCountsAcc[textElement.xPositionProportion] = actualCount + 1;
        return xCountsAcc;
      },
      xCounts,
    );
  }
}
