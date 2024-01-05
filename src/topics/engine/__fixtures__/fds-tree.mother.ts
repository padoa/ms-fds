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
  aLineWithWarningNoticeIdentifierAndValue,
} from '@topics/engine/__fixtures__/line.mother.js';
import { aSection } from '@topics/engine/__fixtures__/section.mother.js';
import { aSubSection, aSubSectionWithContent } from '@topics/engine/__fixtures__/sub-section.mother.js';
import { aTextWithCasNumber, aTextWithCeNumber, aTextWithConcentration, aTextWithHDanger } from '@topics/engine/__fixtures__/text.mother.js';

export const aFdsTree = (): FdsTreeBuilder => new FdsTreeBuilder();

export const anEmptyFdsTreeWithAllSections = (): FdsTreeBuilder =>
  aFdsTree()
    .withSection1(aSection().withSubsections({ 1: aSubSection(), 3: aSubSection() }))
    .withSection2(aSection().withSubsections({ 2: aSubSection() }))
    .withSection3(aSection().withSubsections({ 1: aSubSection(), 2: aSubSection() }))
    .withSection9(aSection().withSubsections({ 1: aSubSection() }));

export const aFdsTreeWithAllSectionsWithoutUsefulInfo = (): FdsTreeBuilder =>
  aFdsTree()
    .withSection1(aSection().withSubsections({ 1: aSubSectionWithContent(), 3: aSubSectionWithContent() }))
    .withSection2(aSection().withSubsections({ 2: aSubSectionWithContent() }))
    .withSection3(aSection().withSubsections({ 1: aSubSectionWithContent(), 2: aSubSectionWithContent() }))
    .withSection9(aSection().withSubsections({ 1: aSubSectionWithContent() }));

export const aFdsTreeWithAllSectionsWithUsefulInfo = (): FdsTreeBuilder =>
  aFdsTree()
    .withSection1(
      aSection().withSubsections({
        1: aSubSection().withLines([aLineWithProductIn1Text()]),
        3: aSubSection().withLines([aLineWithProducerIdentifierOnlyWithColon(), aLineWithProducerNameOnly()]),
      }),
    )
    .withSection2(
      aSection().withSubsections({
        2: aSubSection().withLines([aLineWithWarningNoticeIdentifierAndValue(), aLineWithThreeDangersAndTheirDetails()]),
      }),
    )
    .withSection3(
      aSection().withSubsections({
        2: aSubSection().withLines([aLine().withTexts([aTextWithCasNumber(), aTextWithCeNumber(), aTextWithConcentration(), aTextWithHDanger()])]),
      }),
    )
    .withSection9(
      aSection().withSubsections({
        1: aSubSection().withLines([
          aLineWithPhysicalStateIdentifierAndValue(),
          aLineWithVaporPressureIdentifierAndValue(),
          aLineWithBoilingPointIdentifierAndValue(),
        ]),
      }),
    );
