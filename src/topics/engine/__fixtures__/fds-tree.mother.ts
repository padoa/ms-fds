import { FdsTreeBuilder } from '@topics/engine/__fixtures__/fds-tree.builder.js';
import {
  aLineWithProducerIdentifierOnlyWithColon,
  aLineWithProducerNameOnly,
  aLineWithProductIn1Text,
  aLineWithVaporPressureIdentifierAndValue,
  aLineWithThreeDangersAndTheirDetails,
  aLineWithPhysicalStateIdentifierAndValue,
  aLineWithBoilingPointIdentifierAndValue,
  aLine,
} from '@topics/engine/__fixtures__/line.mother.js';
import { aSection } from '@topics/engine/__fixtures__/section.mother.js';
import { aSubSection, aSubSectionWithContent } from '@topics/engine/__fixtures__/sub-section.mother.js';
import { aTextWithCasNumber, aTextWithCeNumber, aTextWithConcentration, aTextWithHDanger } from '@topics/engine/__fixtures__/text.mother.js';

export const aFdsTree = (): FdsTreeBuilder => new FdsTreeBuilder();

export const anEmptyFdsTreeWithAllSections = (): FdsTreeBuilder =>
  aFdsTree()
    .withSection1(aSection().withSubsections({ 1: aSubSection().properties, 3: aSubSection().properties }).properties)
    .withSection2(aSection().withSubsections({ 2: aSubSection().properties }).properties)
    .withSection3(aSection().withSubsections({ 1: aSubSection().properties, 2: aSubSection().properties }).properties)
    .withSection9(aSection().withSubsections({ 1: aSubSection().properties }).properties);

export const aFdsTreeWithAllSectionsWithoutUsefulInfo = (): FdsTreeBuilder =>
  aFdsTree()
    .withSection1(aSection().withSubsections({ 1: aSubSectionWithContent().properties, 3: aSubSectionWithContent().properties }).properties)
    .withSection2(aSection().withSubsections({ 2: aSubSectionWithContent().properties }).properties)
    .withSection3(aSection().withSubsections({ 1: aSubSectionWithContent().properties, 2: aSubSectionWithContent().properties }).properties)
    .withSection9(aSection().withSubsections({ 1: aSubSectionWithContent().properties }).properties);

export const aFdsTreeWithAllSectionsWithUsefulInfo = (): FdsTreeBuilder =>
  aFdsTree()
    .withSection1(
      aSection().withSubsections({
        1: aSubSection().withLines([aLineWithProductIn1Text().properties]).properties,
        3: aSubSection().withLines([aLineWithProducerIdentifierOnlyWithColon().properties, aLineWithProducerNameOnly().properties]).properties,
      }).properties,
    )
    .withSection2(
      aSection().withSubsections({ 2: aSubSection().withLines([aLineWithThreeDangersAndTheirDetails().properties]).properties }).properties,
    )
    .withSection3(
      aSection().withSubsections({
        2: aSubSection().withLines([
          aLine().withTexts([
            aTextWithCasNumber().properties,
            aTextWithCeNumber().properties,
            aTextWithConcentration().properties,
            aTextWithHDanger().properties,
          ]).properties,
        ]).properties,
      }).properties,
    )
    .withSection9(
      aSection().withSubsections({
        1: aSubSection().withLines([
          aLineWithPhysicalStateIdentifierAndValue().properties,
          aLineWithVaporPressureIdentifierAndValue().properties,
          aLineWithBoilingPointIdentifierAndValue().properties,
        ]).properties,
      }).properties,
    );
