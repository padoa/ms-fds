import _ from 'lodash';

import type { IFDSTree, ILine, ISubsection, IXCounts } from '@topics/engine/model/fds.model.js';
import { SectionRulesService } from '@topics/engine/rules/section-rules.service.js';
import type { IBuildTree, IFDSTreeResult } from '@topics/engine/transformer/fds-tree-builder.model.js';

export class FDSTreeBuilderService {
  public static buildFdsTree(lines: ILine[]): IFDSTreeResult {
    const result = _.reduce(
      lines,
      ({ fdsTree, currentSection, currentSubSection, xCounts: XCountsBeforeUpdate, fullText: fullTextBeforeUpdate }: IBuildTree, line) => {
        const xCounts = this.updateXCounts(XCountsBeforeUpdate, line);
        const fullTextLine = line.texts.map((t) => t.content).join('');
        const fullText = `${fullTextBeforeUpdate}${fullTextLine}`;

        const { interestingSection, sectionNumber: newSection } = SectionRulesService.isAnInterestingSection(fullTextLine, { currentSection });
        if (interestingSection) {
          return {
            fdsTree: this.addFDSTreeSection(fdsTree, { line, sectionNumber: newSection }),
            currentSection: newSection,
            currentSubSection: 0,
            xCounts,
            fullText,
          };
        }

        const { interestingSubSection, subSectionNumber: newSubSection } = SectionRulesService.isAnInterestingSubSection(fullTextLine, {
          currentSection,
          currentSubSection,
        });
        if (interestingSubSection) {
          return {
            fdsTree: this.addFDSTreeSubSection(fdsTree, {
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

        if (SectionRulesService.isSwitchingSection(fullTextLine, { currentSection })) {
          return { fdsTree, currentSection: currentSection + 1, currentSubSection: null, xCounts, fullText };
        }

        if (SectionRulesService.isSwitchingSubSection(fullTextLine, { currentSection, currentSubSection })) {
          return { fdsTree, currentSection, currentSubSection: currentSubSection + 1, xCounts, fullText };
        }

        if (SectionRulesService.shouldAddLineInCurrentSubSection(currentSection, currentSubSection)) {
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
      { fdsTree: {}, currentSection: null, currentSubSection: null, xCounts: {}, fullText: '', currentLine: null } as IBuildTree,
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

  public static addFDSTreeSection(fdsTree: IFDSTree, { line, sectionNumber }: { line: ILine; sectionNumber: number }): IFDSTree {
    return {
      ...fdsTree,
      [sectionNumber]: {
        xPositionProportion: line.startBox.xPositionProportion,
        yPositionProportion: line.startBox.yPositionProportion,
        subsections: {} as ISubsection,
      },
    };
  }

  public static addFDSTreeSubSection(
    fdsTree: IFDSTree,
    { line, sectionNumber, subSectionNumber }: { line: ILine; sectionNumber: number; subSectionNumber: number },
  ): IFDSTree {
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
    fdsTree: IFDSTree,
    { line, sectionNumber, subSectionNumber }: { line: ILine; sectionNumber: number; subSectionNumber: number },
  ): IFDSTree {
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
