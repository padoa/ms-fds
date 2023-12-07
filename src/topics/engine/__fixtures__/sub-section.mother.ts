import { aLineWithProductNameOnly, aLineWithTwoTexts } from '@topics/engine/__fixtures__/line.mother.js';
import { SubSectionBuilder } from '@topics/engine/__fixtures__/sub-section.builder.js';

export const aSubSection = (): SubSectionBuilder => new SubSectionBuilder();

//----------------------------------------------------------------------------------------------
//----------------------------------------- BASICS ---------------------------------------------
//----------------------------------------------------------------------------------------------

export const aSubSectionWithContent = (): SubSectionBuilder => aSubSection().withLines([aLineWithTwoTexts().properties]);

//----------------------------------------------------------------------------------------------
//----------------------------------------- PRODUCT_NAME ---------------------------------------
//----------------------------------------------------------------------------------------------

export const aSubSectionWith3LinesContainingProductName = (): SubSectionBuilder =>
  aSubSection().withLines([aLineWithProductNameOnly().properties, aLineWithProductNameOnly().properties, aLineWithProductNameOnly().properties]);
