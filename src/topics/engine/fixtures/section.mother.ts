import { POSITION_PROPORTION_X, POSITION_PROPORTION_Y } from '@topics/engine/fixtures/fixtures.constants.js';
import { SectionBuilder } from '@topics/engine/fixtures/section.builder.js';

export const aSection = (): SectionBuilder => new SectionBuilder();

//----------------------------------------------------------------------------------------------
//----------------------------------------- BASICS ---------------------------------------------
//----------------------------------------------------------------------------------------------

export const aSectionWithPosition = (): SectionBuilder =>
  aSection().withXPositionProportion(POSITION_PROPORTION_X).withYPositionProportion(POSITION_PROPORTION_Y);
