import { describe, expect, it } from 'vitest';
import type { IExtractedProduct, IMetaData } from '@padoa/chemical-risk';

import { aFdsTree, anEmptyFdsTreeWithAllSections, aFdsTreeWithAllSectionsWithoutUsefulInfo } from '@topics/engine/__fixtures__/fds-tree.mother.js';
import {
  RAW_PRODUCT_NAME,
  RAW_PRODUCT_IDENTIFIER_WITH_COLON,
  RAW_PLACEHOLDER_TEXT_1,
  RAW_PLACEHOLDER_TEXT_2,
  RAW_PLACEHOLDER_TEXT_3,
  RAW_PRODUCT_IDENTIFIER,
  RAW_TEXT_CONTENT,
} from '@topics/engine/__fixtures__/fixtures.constants.js';
import {
  aLineWithUndefinedText,
  aLineWithProductIn1Text,
  aLineWithProductIn2Texts,
  aLine,
  aLineWithProductIdentifierOnly,
  aLineWithOneText,
  aLineWithProductNameOnly,
} from '@topics/engine/__fixtures__/line.mother.js';
import { aSection } from '@topics/engine/__fixtures__/section.mother.js';
import { aSubSection, aSubSectionWith3LinesContainingProductName } from '@topics/engine/__fixtures__/sub-section.mother.js';
import { aTextWithRandomContent1, aTextWithRandomContent2, aTextWithRandomContent3 } from '@topics/engine/__fixtures__/text.mother.js';
import type { IFdsTree } from '@topics/engine/model/fds.model.js';
import { ProductRulesService } from '@topics/engine/rules/extraction-rules/product-rules.service.js';
import { aPosition } from '@topics/engine/__fixtures__/position.mother.js';

describe('ProductRulesService tests', () => {
  const metaData: IMetaData = { startBox: aPosition().properties };

  describe('GetProductByText tests', () => {
    it.each<[{ message: string; fdsTree: IFdsTree; expected: IExtractedProduct | null }]>([
      [
        {
          message: 'should return null when providing a fdsTree with an undefined text',
          fdsTree: aFdsTree().withSection1(
            aSection().withSubsections({
              1: aSubSection().withLines([aLineWithUndefinedText().properties]).properties,
            }).properties,
          ).properties,
          expected: null,
        },
      ],
      [
        {
          message: 'should return null when providing a fdsTree with all subsections but all empty',
          fdsTree: anEmptyFdsTreeWithAllSections().properties,
          expected: null,
        },
      ],
      [
        {
          message: 'should return null when providing a fdsTree with all subsections filled without product name',
          fdsTree: aFdsTreeWithAllSectionsWithoutUsefulInfo().properties,
          expected: null,
        },
      ],
      [
        {
          message: 'should return product name when it is contained in 1 text',
          fdsTree: aFdsTree().withSection1(
            aSection().withSubsections({ 1: aSubSection().withLines([aLineWithProductIn1Text().properties]).properties }).properties,
          ).properties,
          expected: { name: RAW_PRODUCT_NAME, metaData },
        },
      ],
      [
        {
          message: 'should return product name when it is contained in 2 different texts of same line',
          fdsTree: aFdsTree().withSection1(
            aSection().withSubsections({ 1: aSubSection().withLines([aLineWithProductIn2Texts().properties]).properties }).properties,
          ).properties,
          expected: { name: RAW_PRODUCT_NAME, metaData },
        },
      ],
    ])('$message', ({ fdsTree, expected }) => {
      expect(ProductRulesService.getProductByText(fdsTree)).toEqual(expected);
    });
  });

  describe('GetProductByLineOrder tests', () => {
    it.each<[{ message: string; fdsTree: IFdsTree; fullText: string; expected: IExtractedProduct | null }]>([
      [
        {
          message: 'should return null when providing a fdsTree with an undefined text',
          fdsTree: aFdsTree().withSection1(
            aSection().withSubsections({
              1: aSubSection().withLines([aLineWithUndefinedText().properties]).properties,
            }).properties,
          ).properties,
          fullText: '',
          expected: null,
        },
      ],
      [
        {
          message: 'should return null when providing a fdsTree with all subsections but all empty',
          fdsTree: anEmptyFdsTreeWithAllSections().properties,
          fullText: '',
          expected: null,
        },
      ],
      [
        {
          message: 'should return null when providing a fdsTree with all subsections filled without product name',
          fdsTree: aFdsTree().withSection1(
            aSection().withSubsections({
              1: aSubSection().withLines([
                aLine().withTexts([aTextWithRandomContent1().properties, aTextWithRandomContent2().properties]).properties,
                aLine().withTexts([aTextWithRandomContent3().properties]).properties,
              ]).properties,
            }).properties,
          ).properties,
          fullText: `${RAW_PLACEHOLDER_TEXT_1}${RAW_PLACEHOLDER_TEXT_2}${RAW_PLACEHOLDER_TEXT_3}`,
          expected: null,
        },
      ],
      [
        {
          message: 'should skip lines containing only product identifier',
          fdsTree: aFdsTree().withSection1(
            aSection().withSubsections({
              1: aSubSection().withLines([aLineWithProductIdentifierOnly().properties]).properties,
            }).properties,
          ).properties,
          fullText: RAW_PRODUCT_IDENTIFIER,
          expected: null,
        },
      ],
      [
        {
          message: 'should return null when product name only appears twice in fullText',
          fdsTree: aFdsTree().withSection1(
            aSection().withSubsections({
              1: aSubSection().withLines([
                aLineWithOneText().properties,
                aLineWithProductNameOnly().properties,
                aLineWithProductNameOnly().properties,
              ]).properties,
            }).properties,
          ).properties,
          fullText: `${RAW_TEXT_CONTENT}${RAW_PRODUCT_NAME}${RAW_PRODUCT_NAME}`,
          expected: null,
        },
      ],
      [
        {
          message: 'should return product name when it appears three times in fullText',
          fdsTree: aFdsTree().withSection1(
            aSection().withSubsections({
              1: aSubSectionWith3LinesContainingProductName().properties,
            }).properties,
          ).properties,
          fullText: `${RAW_PRODUCT_NAME.repeat(3)}`,
          expected: { name: RAW_PRODUCT_NAME, metaData },
        },
      ],
      [
        {
          message: 'should skip first line containing product identifier and return product name when it appears three times in fullText',
          fdsTree: aFdsTree().withSection1(
            aSection().withSubsections({
              1: aSubSection().withLines([
                aLineWithProductIdentifierOnly().properties,
                aLineWithProductNameOnly().properties,
                aLineWithProductNameOnly().properties,
                aLineWithProductNameOnly().properties,
              ]).properties,
            }).properties,
          ).properties,
          fullText: `${RAW_PRODUCT_IDENTIFIER}${RAW_PRODUCT_NAME.repeat(3)}`,
          expected: { name: RAW_PRODUCT_NAME, metaData },
        },
      ],
    ])('$message', ({ fdsTree, fullText, expected }) => {
      expect(ProductRulesService.getProductByLineOrder(fdsTree, { fullText })).toEqual(expected);
    });
  });

  describe('GetProduct tests', () => {
    it.each<[{ message: string; fdsTree: IFdsTree; fullText: string; expected: IExtractedProduct | null }]>([
      [
        {
          message: 'it should return null when providing an empty fdsTree',
          fdsTree: anEmptyFdsTreeWithAllSections().properties,
          fullText: '',
          expected: null,
        },
      ],
      // enters getProductByText
      [
        {
          message: 'it should return product name when identifier is in one line and product in another line',
          fdsTree: aFdsTree().withSection1(
            aSection().withSubsections({
              1: aSubSection().withLines([aLineWithProductIdentifierOnly().properties, aLineWithProductNameOnly().properties]).properties,
            }).properties,
          ).properties,
          fullText: `${RAW_PRODUCT_IDENTIFIER_WITH_COLON}${RAW_PRODUCT_NAME}`,
          expected: { name: RAW_PRODUCT_NAME, metaData },
        },
      ],
      // enters getProductByLineOrder
      [
        {
          message: 'should return product name when it appears three times or more in fullText',
          fdsTree: aFdsTree().withSection1(
            aSection().withSubsections({
              1: aSubSectionWith3LinesContainingProductName().properties,
            }).properties,
          ).properties,
          fullText: `${RAW_PRODUCT_NAME.repeat(3)}`,
          expected: { name: RAW_PRODUCT_NAME, metaData },
        },
      ],
    ])('$message', ({ fdsTree, fullText, expected }) => {
      expect(ProductRulesService.getProduct(fdsTree, { fullText })).toEqual(expected);
    });
  });
});
