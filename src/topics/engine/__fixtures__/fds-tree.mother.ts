import { FdsTreeBuilder } from '@topics/engine/__fixtures__/fds-tree.builder.js';
import {
  aLineWithCASAndCENumberIn2Texts,
  aLineWithPhysicalStateIdentifierAndValue,
  aLineWithProducerIdentifierOnlyWithColon,
  aLineWithProducerNameOnly,
  aLineWithProductIn1Text,
  aLineWithSteamPressureIdentifierAndValue,
  aLineWithThreeDangersAndTheirDetails,
} from '@topics/engine/__fixtures__/line.mother.js';
import { aSection } from '@topics/engine/__fixtures__/section.mother.js';
import { aSubSection, aSubSectionWithContent } from '@topics/engine/__fixtures__/sub-section.mother.js';

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
        2: aSubSection().withLines([aLineWithCASAndCENumberIn2Texts().properties]).properties,
      }).properties,
    )
    .withSection9(
      aSection().withSubsections({
        1: aSubSection().withLines([aLineWithPhysicalStateIdentifierAndValue().properties, aLineWithSteamPressureIdentifierAndValue().properties])
          .properties,
      }).properties,
    );
