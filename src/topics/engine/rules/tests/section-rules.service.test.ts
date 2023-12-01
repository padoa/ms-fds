import { describe, expect, it } from 'vitest';

import { SectionRulesService } from '@topics/engine/rules/section-rules.service.js';

describe('Section rules tests', () => {
  describe('isAnInterestingSection', () => {
    it.each([
      {
        section: null,
        expected: false,
      },
      {
        section: 1,
        expected: true,
      },
      {
        section: 2,
        expected: true,
      },
      {
        section: 3,
        expected: true,
      },
      {
        section: 4,
        expected: false,
      },
      {
        section: 5,
        expected: false,
      },
      {
        section: 6,
        expected: false,
      },
      {
        section: 7,
        expected: false,
      },
      {
        section: 8,
        expected: false,
      },
      {
        section: 9,
        expected: true,
      },
      {
        section: 10,
        expected: false,
      },
    ])('should return $expected with input section $section', ({ section, expected }: { section: number; expected: boolean }) => {
      expect(SectionRulesService.isAnInterestingSection(section)).toEqual(expected);
    });
  });

  describe('isAnInterestingSubSection', () => {
    it.each([
      {
        section: 1,
        subSection: 1,
        expected: true,
      },
      {
        section: 1,
        subSection: 2,
        expected: false,
      },
      {
        section: 1,
        subSection: 3,
        expected: true,
      },
      {
        section: 1,
        subSection: 4,
        expected: false,
      },
      {
        section: 2,
        subSection: 1,
        expected: false,
      },
      {
        section: 2,
        subSection: 2,
        expected: true,
      },
      {
        section: 2,
        subSection: 3,
        expected: false,
      },
      {
        section: 3,
        subSection: 1,
        expected: true,
      },
      {
        section: 3,
        subSection: 2,
        expected: true,
      },
      {
        section: 9,
        subSection: 1,
        expected: true,
      },
      {
        section: 9,
        subSection: 2,
        expected: false,
      },
    ])(
      'should return %expected with input section $section',
      ({ section, subSection, expected }: { section: number; subSection: number; expected: boolean }) => {
        expect(SectionRulesService.isAnInterestingSubSection(section, subSection)).toEqual(expected);
      },
    );
  });

  describe('computeNewSection', () => {
    it.each([
      {
        message: 'should handle null text',
        text: null,
        section: 1,
        expected: 1,
      },
      {
        message: 'should handle empty text',
        text: '',
        section: 1,
        expected: 1,
      },
      {
        message: 'should handle empty section',
        text: 'rubrique 1',
        section: null,
        expected: 1,
      },
      {
        message: 'should increment when the text matches the next section',
        text: 'rubrique 1',
        section: 0,
        expected: 1,
      },
      {
        message: 'should not increment when the text does not match a section',
        text: 'rubrique',
        section: 0,
        expected: 0,
      },
      {
        message: 'should not increment when the text does not match the next section',
        text: 'identification des dangers',
        section: 0,
        expected: 0,
      },
      {
        message: 'should match texts with spaces',
        text: 'identification des dangers',
        section: 1,
        expected: 2,
      },
      {
        message: 'should not increment when there is no more sections to look for',
        text: 'rubrique 11',
        section: 10,
        expected: 10,
      },
    ])(
      'should return $expect with input section $section and text $text',
      ({ text, section, expected }: { text: string; section: number; expected: number }) => {
        expect(SectionRulesService.computeNewSection(text, { currentSection: section })).toEqual(expected);
      },
    );
  });

  describe('computeNewSubSection', () => {
    it.each([
      {
        message: 'should handle null text',
        text: null,
        section: 1,
        subSection: 1,
        expected: 1,
      },
      {
        message: 'should handle empty text',
        text: '',
        section: 1,
        subSection: 1,
        expected: 1,
      },
      {
        message: 'should handle null section',
        text: '1.1',
        section: null,
        subSection: 1,
        expected: 1,
      },
      {
        message: 'should handle null subSection',
        text: '1.1',
        section: 1,
        subSection: null,
        expected: 1,
      },
      {
        message: 'should increment the sub section when matching an interesting sub section',
        text: '1.1',
        section: 1,
        subSection: 0,
        expected: 1,
      },
      {
        message: 'should not increment the sub section when matching the current sub section',
        text: '1.1',
        section: 1,
        subSection: 1,
        expected: 1,
      },
      {
        message: 'should increment the sub section when matching the a sub section (even if it is not an interesting one)',
        text: '1.2',
        section: 1,
        subSection: 1,
        expected: 2,
      },
      {
        message: 'should prioritize an interesting sub section over the following sub section',
        text: '1.3',
        section: 1,
        subSection: 1,
        expected: 3,
      },
      {
        message: 'should increment the sub section even if there are no more interesting sub sections',
        text: '1.4',
        section: 1,
        subSection: 3,
        expected: 4,
      },
      {
        message: 'should match texts with spaces',
        text: '1. 1',
        section: 1,
        subSection: 0,
        expected: 1,
      },
    ])('$message', ({ text, section, subSection, expected }: { text: string; section: number; subSection: number; expected: number }) => {
      expect(SectionRulesService.computeNewSubSection(text, { currentSection: section, currentSubSection: subSection })).toEqual(expected);
    });
  });
});
