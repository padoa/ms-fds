import type { SpyInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ILine } from '@topics/engine/model/fds.model.js';
import type { IFDSTreeResult } from '@topics/engine/transformer/fds-tree-builder.model.js';
import type { IInterestingSection, IInterestingSubSection } from '@topics/engine/rules/rules.model.js';
import { SectionRulesService } from '@topics/engine/rules/section-rules.service.js';
import { FDSTreeBuilderService } from '@topics/engine/transformer/fds-tree-builder.service.js';

describe('FdsTreeBuilderService tests', () => {
  describe('BuildFdsTree tests', () => {
    let isAnInterestingSectionSpy: SpyInstance<[text: string, { currentSection: number }], IInterestingSection>;
    let isAnInterestingSubSectionSpy: SpyInstance<[text: string, { currentSection: number; currentSubSection: number }], IInterestingSubSection>;
    let isSwitchingSectionSpy: SpyInstance<[text: string, { currentSection: number }], boolean>;
    let isSwitchingSubSectionSpy: SpyInstance<[text: string, { currentSection: number; currentSubSection: number }], boolean>;
    let shouldAddLineInCurrentSubSectionSpy: SpyInstance<[currentSection: number, currentSubSection: number], boolean>;

    beforeEach(() => {
      isAnInterestingSectionSpy = vi.spyOn(SectionRulesService, 'isAnInterestingSection');
      isAnInterestingSubSectionSpy = vi.spyOn(SectionRulesService, 'isAnInterestingSubSection');
      isSwitchingSectionSpy = vi.spyOn(SectionRulesService, 'isSwitchingSection');
      isSwitchingSubSectionSpy = vi.spyOn(SectionRulesService, 'isSwitchingSubSection');
      shouldAddLineInCurrentSubSectionSpy = vi.spyOn(SectionRulesService, 'shouldAddLineInCurrentSubSection');
    });

    afterEach(() => {
      isAnInterestingSubSectionSpy.mockRestore();
      isAnInterestingSectionSpy.mockRestore();
      isSwitchingSectionSpy.mockRestore();
      isSwitchingSubSectionSpy.mockRestore();
      shouldAddLineInCurrentSubSectionSpy.mockRestore();
    });

    describe('BuildFdsTree tests without sections', () => {
      beforeEach(() => {
        isAnInterestingSectionSpy.mockImplementation((): IInterestingSection => ({ interestingSection: false, sectionNumber: null }));
        isAnInterestingSubSectionSpy.mockImplementation((): IInterestingSubSection => ({ interestingSubSection: false }));
        isSwitchingSectionSpy.mockImplementation((): boolean => false);
        isSwitchingSubSectionSpy.mockImplementation((): boolean => false);
        shouldAddLineInCurrentSubSectionSpy.mockImplementation((): boolean => false);
      });

      it('should return empty values when providing undefined lines', () => {
        const expected: IFDSTreeResult = { fdsTree: {}, xCounts: {}, fullText: '' };
        expect(FDSTreeBuilderService.buildFdsTree(undefined)).toEqual(expected);
      });

      it('should return empty values when providing empty lines', () => {
        const expected: IFDSTreeResult = { fdsTree: {}, xCounts: {}, fullText: '' };
        expect(FDSTreeBuilderService.buildFdsTree([])).toEqual(expected);
      });

      it('should return empty fds tree and concatenated texts when given one line with no section', () => {
        const lines: ILine[] = [
          {
            pageNumber: 1,
            startBox: {
              xPositionProportion: 3.29,
              yPositionProportion: 3.292,
            },
            texts: [
              { xPositionProportion: 3.29, yPositionProportion: 3.292, content: 'c1' },
              { xPositionProportion: 26.78, yPositionProportion: 3.292, content: 'c2' },
            ],
          },
        ];
        const expected: IFDSTreeResult = { fdsTree: {}, xCounts: { 26.78: 1, 3.29: 1 }, fullText: 'c1c2' };
        expect(FDSTreeBuilderService.buildFdsTree(lines)).toEqual(expected);
      });

      it('should return empty fds tree and concatenated texts when given two lines with no section', () => {
        const lines: ILine[] = [
          {
            pageNumber: 1,
            startBox: {
              xPositionProportion: 3.29,
              yPositionProportion: 3.292,
            },
            texts: [
              { xPositionProportion: 3.29, yPositionProportion: 3.292, content: 'c1' },
              { xPositionProportion: 26.78, yPositionProportion: 3.292, content: 'c2' },
            ],
          },
          {
            pageNumber: 1,
            startBox: { xPositionProportion: 3.29, yPositionProportion: 4.567 },
            texts: [{ xPositionProportion: 3.29, yPositionProportion: 4.567, content: 'c3' }],
          },
        ];
        const expected: IFDSTreeResult = { fdsTree: {}, xCounts: { 26.78: 1, 3.29: 2 }, fullText: 'c1c2c3' };
        expect(FDSTreeBuilderService.buildFdsTree(lines)).toEqual(expected);
      });
    });

    describe('BuildFdsTree tests with sections', () => {
      beforeEach(() => {
        isAnInterestingSectionSpy
          .mockImplementationOnce((): IInterestingSection => ({ interestingSection: true, sectionNumber: 1 }))
          .mockImplementationOnce((): IInterestingSection => ({ interestingSection: true, sectionNumber: 2 }));
        isAnInterestingSubSectionSpy.mockImplementation((): IInterestingSubSection => ({ interestingSubSection: false }));
        isSwitchingSectionSpy.mockImplementation((): boolean => false);
        isSwitchingSubSectionSpy.mockImplementation((): boolean => false);
        shouldAddLineInCurrentSubSectionSpy.mockImplementation((): boolean => false);
      });

      it('should return fds tree when given lines with one section', () => {
        const lines: ILine[] = [
          {
            pageNumber: 1,
            startBox: {
              xPositionProportion: 3.29,
              yPositionProportion: 3.292,
            },
            texts: [
              { xPositionProportion: 3.29, yPositionProportion: 3.292, content: 'interestingSection' },
              { xPositionProportion: 26.78, yPositionProportion: 3.292, content: 'content' },
            ],
          },
        ];
        const expected: IFDSTreeResult = {
          fdsTree: {
            1: {
              subsections: {},
              xPositionProportion: 3.29,
              yPositionProportion: 3.292,
            },
          },
          xCounts: { 26.78: 1, 3.29: 1 },
          fullText: 'interestingSectioncontent',
        };
        expect(FDSTreeBuilderService.buildFdsTree(lines)).toEqual(expected);
      });

      it('should return fds tree when given lines with two sections', () => {
        const lines: ILine[] = [
          {
            pageNumber: 1,
            startBox: {
              xPositionProportion: 3.29,
              yPositionProportion: 3.292,
            },
            texts: [
              { xPositionProportion: 3.29, yPositionProportion: 3.292, content: 'interestingSection' },
              { xPositionProportion: 26.78, yPositionProportion: 3.292, content: 'content' },
            ],
          },
          {
            pageNumber: 1,
            startBox: { xPositionProportion: 3.29, yPositionProportion: 4.567 },
            texts: [{ xPositionProportion: 3.29, yPositionProportion: 4.567, content: 'anotherInterestingSection' }],
          },
        ];
        const expected: IFDSTreeResult = {
          fdsTree: {
            1: {
              subsections: {},
              xPositionProportion: 3.29,
              yPositionProportion: 3.292,
            },
            2: {
              subsections: {},
              xPositionProportion: 3.29,
              yPositionProportion: 4.567,
            },
          },
          xCounts: { 26.78: 1, 3.29: 2 },
          fullText: 'interestingSectioncontentanotherInterestingSection',
        };
        expect(FDSTreeBuilderService.buildFdsTree(lines)).toEqual(expected);
      });
    });

    describe('BuildFdsTree tests with a section and subsections', () => {
      beforeEach(() => {
        isAnInterestingSectionSpy
          .mockImplementationOnce((): IInterestingSection => ({ interestingSection: true, sectionNumber: 1 }))
          .mockImplementation((): IInterestingSection => ({ interestingSection: false, sectionNumber: 1 }));
        isAnInterestingSubSectionSpy
          .mockImplementationOnce((): IInterestingSubSection => ({ interestingSubSection: true, subSectionNumber: 1 }))
          .mockImplementationOnce((): IInterestingSubSection => ({ interestingSubSection: true, subSectionNumber: 2 }));
        isSwitchingSectionSpy.mockImplementation((): boolean => false);
        isSwitchingSubSectionSpy.mockImplementation((): boolean => false);
        shouldAddLineInCurrentSubSectionSpy.mockImplementation((): boolean => false);
      });

      it('should return fds tree when given lines with a section and subsection', () => {
        const sectionLines: ILine[] = [
          {
            pageNumber: 1,
            startBox: {
              xPositionProportion: 3.29,
              yPositionProportion: 3.292,
            },
            texts: [{ xPositionProportion: 3.29, yPositionProportion: 3.292, content: 'interestingSection' }],
          },
        ];
        const subSectionLines: ILine[] = [
          {
            pageNumber: 1,
            startBox: {
              xPositionProportion: 3.013,
              yPositionProportion: 14.311,
            },
            texts: [
              { xPositionProportion: 3.013, yPositionProportion: 14.311, content: 'interesting' },
              { xPositionProportion: 13.651, yPositionProportion: 14.311, content: 'Subsection' },
            ],
          },
        ];

        const expected: IFDSTreeResult = {
          fdsTree: {
            1: {
              subsections: {
                1: {
                  xPositionProportion: 3.013,
                  yPositionProportion: 14.311,
                  lines: subSectionLines,
                },
              },
              xPositionProportion: 3.29,
              yPositionProportion: 3.292,
            },
          },
          xCounts: { 3.29: 1, 13.651: 1, 3.013: 1 },
          fullText: 'interestingSectioninterestingSubsection',
        };
        expect(FDSTreeBuilderService.buildFdsTree([...sectionLines, ...subSectionLines])).toEqual(expected);
      });

      it('should return fds tree when given lines with a section and two subsections', () => {
        const sectionLines: ILine[] = [
          {
            pageNumber: 1,
            startBox: {
              xPositionProportion: 3.29,
              yPositionProportion: 3.292,
            },
            texts: [{ xPositionProportion: 3.29, yPositionProportion: 3.292, content: 'interestingSection' }],
          },
        ];
        const subSectionsLines: ILine[] = [
          {
            pageNumber: 1,
            startBox: {
              xPositionProportion: 3.013,
              yPositionProportion: 14.311,
            },
            texts: [
              { xPositionProportion: 3.013, yPositionProportion: 14.311, content: 'interesting' },
              { xPositionProportion: 13.651, yPositionProportion: 14.311, content: 'Subsection' },
            ],
          },
          {
            pageNumber: 1,
            startBox: {
              xPositionProportion: 3.013,
              yPositionProportion: 17.621,
            },
            texts: [
              { xPositionProportion: 3.013, yPositionProportion: 17.621, content: 'anotherInteresting' },
              { xPositionProportion: 13.651, yPositionProportion: 14.311, content: 'Subsection' },
            ],
          },
        ];

        const expected: IFDSTreeResult = {
          fdsTree: {
            1: {
              subsections: {
                1: {
                  xPositionProportion: 3.013,
                  yPositionProportion: 14.311,
                  lines: [subSectionsLines[0]],
                },
                2: {
                  xPositionProportion: 3.013,
                  yPositionProportion: 17.621,
                  lines: [subSectionsLines[1]],
                },
              },
              xPositionProportion: 3.29,
              yPositionProportion: 3.292,
            },
          },
          xCounts: { 3.29: 1, 13.651: 2, 3.013: 2 },
          fullText: 'interestingSectioninterestingSubsectionanotherInterestingSubsection',
        };
        expect(FDSTreeBuilderService.buildFdsTree([...sectionLines, ...subSectionsLines])).toEqual(expected);
      });
    });

    describe('BuildFdsTree tests with section switching', () => {
      beforeEach(() => {
        isAnInterestingSectionSpy.mockImplementation((): IInterestingSection => ({ interestingSection: false, sectionNumber: null }));
        isAnInterestingSubSectionSpy.mockImplementation((): IInterestingSubSection => ({ interestingSubSection: false }));
        isSwitchingSectionSpy.mockImplementation((): boolean => true);
        isSwitchingSubSectionSpy.mockImplementation((): boolean => false);
        shouldAddLineInCurrentSubSectionSpy.mockImplementation((): boolean => false);
      });

      it('should return fds tree when switching section', () => {
        const lines: ILine[] = [
          {
            pageNumber: 1,
            startBox: {
              xPositionProportion: 3.29,
              yPositionProportion: 3.292,
            },
            texts: [
              { xPositionProportion: 3.29, yPositionProportion: 3.292, content: 'c1' },
              { xPositionProportion: 26.78, yPositionProportion: 3.292, content: 'c2' },
            ],
          },
        ];
        const expected: IFDSTreeResult = { fdsTree: {}, xCounts: { 26.78: 1, 3.29: 1 }, fullText: 'c1c2' };
        expect(FDSTreeBuilderService.buildFdsTree(lines)).toEqual(expected);
      });
    });

    describe('BuildFdsTree tests with subSection switching', () => {
      beforeEach(() => {
        isAnInterestingSectionSpy.mockImplementation((): IInterestingSection => ({ interestingSection: false, sectionNumber: null }));
        isAnInterestingSubSectionSpy.mockImplementation((): IInterestingSubSection => ({ interestingSubSection: false }));
        isSwitchingSectionSpy.mockImplementation((): boolean => false);
        isSwitchingSubSectionSpy.mockImplementation((): boolean => true);
        shouldAddLineInCurrentSubSectionSpy.mockImplementation((): boolean => false);
      });

      it('should return fds tree when switching subSection', () => {
        const lines: ILine[] = [
          {
            pageNumber: 1,
            startBox: {
              xPositionProportion: 3.29,
              yPositionProportion: 3.292,
            },
            texts: [
              { xPositionProportion: 3.29, yPositionProportion: 3.292, content: 'c1' },
              { xPositionProportion: 26.78, yPositionProportion: 3.292, content: 'c2' },
            ],
          },
        ];
        const expected: IFDSTreeResult = { fdsTree: {}, xCounts: { 26.78: 1, 3.29: 1 }, fullText: 'c1c2' };
        expect(FDSTreeBuilderService.buildFdsTree(lines)).toEqual(expected);
      });
    });

    describe('BuildFdsTree tests when adding line to current subSection', () => {
      beforeEach(() => {
        isAnInterestingSectionSpy
          .mockImplementationOnce((): IInterestingSection => ({ interestingSection: true, sectionNumber: 1 }))
          .mockImplementation((): IInterestingSection => ({ interestingSection: false, sectionNumber: 1 }));
        isAnInterestingSubSectionSpy
          .mockImplementationOnce((): IInterestingSubSection => ({ interestingSubSection: true, subSectionNumber: 1 }))
          .mockImplementation((): IInterestingSubSection => ({ interestingSubSection: false }));
        isSwitchingSectionSpy.mockImplementation((): boolean => false);
        isSwitchingSubSectionSpy.mockImplementation((): boolean => false);
        shouldAddLineInCurrentSubSectionSpy.mockImplementationOnce((): boolean => true);
      });

      it('should return fds tree with line added to current subSection', () => {
        const sectionLines: ILine[] = [
          {
            pageNumber: 1,
            startBox: {
              xPositionProportion: 3.29,
              yPositionProportion: 3.292,
            },
            texts: [{ xPositionProportion: 3.29, yPositionProportion: 3.292, content: 'interestingSection' }],
          },
        ];
        const subSectionLines: ILine[] = [
          {
            pageNumber: 1,
            startBox: {
              xPositionProportion: 3.013,
              yPositionProportion: 14.311,
            },
            texts: [
              { xPositionProportion: 3.013, yPositionProportion: 14.311, content: 'interesting' },
              { xPositionProportion: 13.651, yPositionProportion: 14.311, content: 'Subsection' },
            ],
          },
        ];
        const extraSubSectionLine: ILine = {
          pageNumber: 1,
          startBox: {
            xPositionProportion: 3.013,
            yPositionProportion: 17.621,
          },
          texts: [{ xPositionProportion: 3.013, yPositionProportion: 17.621, content: 'extraSubsection' }],
        };

        const expected: IFDSTreeResult = {
          fdsTree: {
            1: {
              subsections: {
                1: {
                  xPositionProportion: 3.013,
                  yPositionProportion: 14.311,
                  lines: [...subSectionLines, extraSubSectionLine],
                },
              },
              xPositionProportion: 3.29,
              yPositionProportion: 3.292,
            },
          },
          xCounts: { 3.29: 1, 13.651: 1, 3.013: 2 },
          fullText: 'interestingSectioninterestingSubsectionextraSubsection',
        };
        expect(FDSTreeBuilderService.buildFdsTree([...sectionLines, ...subSectionLines, extraSubSectionLine])).toEqual(expected);
      });
    });
  });
});
