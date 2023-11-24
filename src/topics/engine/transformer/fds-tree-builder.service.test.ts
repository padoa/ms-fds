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
            x: 3.29,
            y: 3.292,
            texts: [
              { x: 3.29, y: 3.292, content: 'c1' },
              { x: 26.78, y: 3.292, content: 'c2' },
            ],
          },
        ];
        const expected: IFDSTreeResult = { fdsTree: {}, xCounts: { 26.78: 1, 3.29: 1 }, fullText: 'c1c2' };
        expect(FDSTreeBuilderService.buildFdsTree(lines)).toEqual(expected);
      });

      it('should return empty fds tree and concatenated texts when given two lines with no section', () => {
        const lines: ILine[] = [
          {
            x: 3.29,
            y: 3.292,
            texts: [
              { x: 3.29, y: 3.292, content: 'c1' },
              { x: 26.78, y: 3.292, content: 'c2' },
            ],
          },
          { x: 3.29, y: 4.567, texts: [{ x: 3.29, y: 4.567, content: 'c3' }] },
        ];
        const expected: IFDSTreeResult = { fdsTree: {}, xCounts: { 26.78: 1, 3.29: 2 }, fullText: 'c1c2c3' };
        expect(FDSTreeBuilderService.buildFdsTree(lines)).toEqual(expected);
      });
    });

    describe('BuildFdsTree tests with sections', () => {
      beforeEach(() => {
        isAnInterestingSectionSpy.mockImplementation((): IInterestingSection => ({ interestingSection: true, sectionNumber: 1 }));
        isAnInterestingSubSectionSpy.mockImplementation((): IInterestingSubSection => ({ interestingSubSection: false }));
        isSwitchingSectionSpy.mockImplementation((): boolean => false);
        isSwitchingSubSectionSpy.mockImplementation((): boolean => false);
        shouldAddLineInCurrentSubSectionSpy.mockImplementation((): boolean => false);
      });

      it('should return fds tree when given lines with one section', () => {
        const lines: ILine[] = [
          {
            x: 3.29,
            y: 3.292,
            texts: [
              { x: 3.29, y: 3.292, content: 'interestingSection' },
              { x: 26.78, y: 3.292, content: 'content' },
            ],
          },
        ];
        const expected: IFDSTreeResult = {
          fdsTree: {
            1: {
              subsections: {},
              x: 3.29,
              y: 3.292,
            },
          },
          xCounts: { 26.78: 1, 3.29: 1 },
          fullText: 'interestingSectioncontent',
        };
        expect(FDSTreeBuilderService.buildFdsTree(lines)).toEqual(expected);
      });

      it('should return fds tree when given lines with two sections', () => {
        // FIXME: add test...
        expect(true).toBe(true);
      });
    });

    describe('BuildFdsTree tests with a section and subsections', () => {
      // TODO: this section comes in second unit tests PR

      beforeEach(() => {
        // FIXME: set mocks...
      });

      it('should return fds tree when given lines with a section and subsection', () => {
        // FIXME: add test...
        expect(true).toBe(true);
      });

      it('should return fds tree when given lines with a section and two subsections', () => {
        // FIXME: add test...
        expect(true).toBe(true);
      });
    });

    describe('BuildFdsTree tests with section switching', () => {
      // TODO: this section comes in second unit tests PR

      beforeEach(() => {
        // FIXME: set mocks...
      });

      it('should return fds tree when switching section', () => {
        // FIXME: add test...
        expect(true).toBe(true);
      });
    });

    describe('BuildFdsTree tests with subSection switching', () => {
      // TODO: this section comes in second unit tests PR

      beforeEach(() => {
        // FIXME: set mocks...
      });

      it('should return fds tree when switching subSection', () => {
        // FIXME: add test...
        expect(true).toBe(true);
      });
    });

    describe('BuildFdsTree tests when adding line to current subSection', () => {
      // TODO: this section comes in second unit tests PR

      beforeEach(() => {
        // FIXME: set mocks...
      });

      it('should return fds tree with line added to current subSection', () => {
        // FIXME: add test...
        expect(true).toBe(true);
      });
    });
  });
});
