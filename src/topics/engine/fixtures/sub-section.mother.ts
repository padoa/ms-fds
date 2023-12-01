import { aLineWithProductNameOnly, aLineWithTwoTexts } from '@topics/engine/fixtures/line.mother.js';
import { SubSectionBuilder } from '@topics/engine/fixtures/sub-section.builder.js';

export const aSubSection = (): SubSectionBuilder => new SubSectionBuilder();

export const aSubSectionWithContent = (): SubSectionBuilder => aSubSection().withLines([aLineWithTwoTexts().properties]);

export const aSubSectionWith3LinesContainingProductName = (): SubSectionBuilder =>
  aSubSection().withLines([aLineWithProductNameOnly().properties, aLineWithProductNameOnly().properties, aLineWithProductNameOnly().properties]);
