import { POSITION_PROPORTION_X, POSITION_PROPORTION_Y } from '@topics/engine/__fixtures__/fixtures.constants.js';
import { aLineWithProductNameOnly, aLineWithTwoTexts } from '@topics/engine/__fixtures__/line.mother.js';
import { SubSectionBuilder } from '@topics/engine/__fixtures__/sub-section.builder.js';

export const aSubSection = (): SubSectionBuilder => new SubSectionBuilder();

//----------------------------------------------------------------------------------------------
//----------------------------------------- BASICS ---------------------------------------------
//----------------------------------------------------------------------------------------------

export const aSubSectionWithContent = (): SubSectionBuilder => aSubSection().withLines([aLineWithTwoTexts().properties]);
export const aSubSectionWithPosition = (): SubSectionBuilder =>
  aSubSection().withXPositionProportion(POSITION_PROPORTION_X).withYPositionProportion(POSITION_PROPORTION_Y);

//----------------------------------------------------------------------------------------------
//----------------------------------------- PRODUCT_NAME ---------------------------------------
//----------------------------------------------------------------------------------------------

export const aSubSectionWith3LinesContainingProductName = (): SubSectionBuilder =>
  aSubSection().withLines([aLineWithProductNameOnly().properties, aLineWithProductNameOnly().properties, aLineWithProductNameOnly().properties]);
