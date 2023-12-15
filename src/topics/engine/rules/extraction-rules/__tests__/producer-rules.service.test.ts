import { describe, expect, it } from 'vitest';

import { aFdsTree, anEmptyFdsTreeWithAllSections } from '@topics/engine/__fixtures__/fds-tree.mother.js';
import { RAW_PRODUCER_NAME, RAW_PRODUCER_NAME_WITH_DOT } from '@topics/engine/__fixtures__/fixtures.constants.js';
import {
  aLineWithUndefinedText,
  aLineWithProducerIdentifierOnly,
  aLineWithProducerIn1Text,
  aLineWithProducerIn2Texts,
  aLineWithProducerIdentifierOnlyWithColon,
  aLineWithProducerNameOnly,
  aLineWithProducerEndingWithDotIn1Text,
  aLineWithProducerWithDotIn1Text,
} from '@topics/engine/__fixtures__/line.mother.js';
import { aSection } from '@topics/engine/__fixtures__/section.mother.js';
import { aSubSection } from '@topics/engine/__fixtures__/sub-section.mother.js';
import type { IFdsTree, IExtractedProducer, IMetaData } from '@topics/engine/model/fds.model.js';
import { ProducerRulesService } from '@topics/engine/rules/extraction-rules/producer-rules.service.js';
import { aPosition } from '@topics/engine/__fixtures__/position.mother.js';

describe('ProducerRulesService tests', () => {
  const metaData: IMetaData = { startBox: aPosition().properties };

  describe('GetProducer tests', () => {
    it.each<[{ message: string; fdsTree: IFdsTree; expected: IExtractedProducer | null }]>([
      [
        {
          message: 'should return null when providing a fdsTree with an undefined text',
          fdsTree: aFdsTree().withSection1(
            aSection().withSubsections({
              3: aSubSection().withLines([aLineWithUndefinedText().properties]).properties,
            }).properties,
          ).properties,
          expected: null,
        },
      ],
      [{ message: 'it should return null when providing an empty fdsTree', fdsTree: anEmptyFdsTreeWithAllSections().properties, expected: null }],
      [
        {
          message: 'should skip lines containing only producer identifier',
          fdsTree: aFdsTree().withSection1(
            aSection().withSubsections({
              3: aSubSection().withLines([aLineWithProducerIdentifierOnly().properties]).properties,
            }).properties,
          ).properties,
          expected: null,
        },
      ],
      [
        {
          message: 'it should return producer name when providing a line with producer in 1 text',
          fdsTree: aFdsTree().withSection1(
            aSection().withSubsections({
              3: aSubSection().withLines([aLineWithProducerIn1Text().properties]).properties,
            }).properties,
          ).properties,
          expected: { name: RAW_PRODUCER_NAME, metaData },
        },
      ],
      [
        {
          message: 'it should skip first line containing producer identifer and return producer name when providing a line with producer in 1 text',
          fdsTree: aFdsTree().withSection1(
            aSection().withSubsections({
              3: aSubSection().withLines([aLineWithProducerIdentifierOnly().properties, aLineWithProducerIn1Text().properties]).properties,
            }).properties,
          ).properties,
          expected: { name: RAW_PRODUCER_NAME, metaData },
        },
      ],
      [
        {
          message: 'it should return producer name when providing a line with producer in 2 texts',
          fdsTree: aFdsTree().withSection1(
            aSection().withSubsections({
              3: aSubSection().withLines([aLineWithProducerIn2Texts().properties]).properties,
            }).properties,
          ).properties,
          expected: { name: RAW_PRODUCER_NAME, metaData },
        },
      ],
      [
        {
          message: 'it should return producer name when providing producer in 2 lines',
          fdsTree: aFdsTree().withSection1(
            aSection().withSubsections({
              3: aSubSection().withLines([aLineWithProducerIdentifierOnlyWithColon().properties, aLineWithProducerNameOnly().properties]).properties,
            }).properties,
          ).properties,
          expected: { name: RAW_PRODUCER_NAME, metaData },
        },
      ],
      // entering cleanProducer
      [
        {
          message: 'it should return producer name when providing producer ending with dot',
          fdsTree: aFdsTree().withSection1(
            aSection().withSubsections({
              3: aSubSection().withLines([aLineWithProducerEndingWithDotIn1Text().properties]).properties,
            }).properties,
          ).properties,
          expected: { name: RAW_PRODUCER_NAME, metaData },
        },
      ],
      [
        {
          message: 'it should return producer name when providing producer with dot in his name',
          fdsTree: aFdsTree().withSection1(
            aSection().withSubsections({
              3: aSubSection().withLines([aLineWithProducerWithDotIn1Text().properties]).properties,
            }).properties,
          ).properties,
          expected: { name: RAW_PRODUCER_NAME_WITH_DOT, metaData },
        },
      ],
    ])('$message', ({ fdsTree, expected }) => {
      expect(ProducerRulesService.getProducer(fdsTree)).toEqual(expected);
    });
  });
});
