import _ from 'lodash';

import type { IFdsTree, ILine, ISubsection, IXCounts } from '@topics/engine/model/fds.model.js';
import { SectionRulesService } from '@topics/engine/rules/section-rules.service.js';
import type { IBuildTree, IFdsTreeResult } from '@topics/engine/transformer/fds-tree-builder.model.js';

export class FdsTreeBuilderService {
  public static buildFdsTree(lines: ILine[]): IFdsTreeResult {
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
          let newFdsTree = fdsTree;
          if (SectionRulesService.isAnInterestingSection(newSection)) {
            newFdsTree = this.addFdsTreeSection(fdsTree, { line, sectionNumber: newSection });
          }

          return { fdsTree: newFdsTree, currentSection: newSection, currentSubSection: 0, xCounts, fullText };
        }

        // SUBSECTION
        const newSubSection = SectionRulesService.computeNewSubSection(fullTextLine, { currentSection, currentSubSection });
        const subSectionChanged = newSubSection !== currentSubSection;
        if (subSectionChanged) {
          let newFdsTree = fdsTree;
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
            fdsTree: this.addFdsTreeLine(fdsTree, {
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

  //----------------------------------------------------------------------------------------------
  //--------------------------------------- BUILDERS ---------------------------------------------
  //----------------------------------------------------------------------------------------------

  public static addFdsTreeSection(fdsTree: IFdsTree, { line, sectionNumber }: { line: ILine; sectionNumber: number }): IFdsTree {
    return {
      ...fdsTree,
      [sectionNumber]: {
        xPositionProportion: line.startBox.xPositionProportion,
        yPositionProportion: line.startBox.yPositionProportion,
        subsections: {} as ISubsection,
      },
    };
  }

  public static addFdsTreeSubSection(
    fdsTree: IFdsTree,
    { line, sectionNumber, subSectionNumber }: { line: ILine; sectionNumber: number; subSectionNumber: number },
  ): IFdsTree {
    return {
      ...fdsTree,
      [sectionNumber]: {
        ...fdsTree[sectionNumber],
        subsections: {
          ...fdsTree[sectionNumber].subsections,
          [subSectionNumber]: {
            xPositionProportion: line.startBox.xPositionProportion,
            yPositionProportion: line.startBox.yPositionProportion,
            lines: [line],
          },
        },
      },
    };
  }

  public static addFdsTreeLine(
    fdsTree: IFdsTree,
    { line, sectionNumber, subSectionNumber }: { line: ILine; sectionNumber: number; subSectionNumber: number },
  ): IFdsTree {
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
