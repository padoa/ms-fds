import { POSITION_X, POSITION_Y } from '@topics/engine/fixtures/fixtures.constants.js';
import { SectionBuilder } from '@topics/engine/fixtures/section.builder.js';

export const aSection = (): SectionBuilder => new SectionBuilder();

//----------------------------------------------------------------------------------------------
//----------------------------------------- BASICS ---------------------------------------------
//----------------------------------------------------------------------------------------------

export const aSectionWithPosition = (): SectionBuilder => aSection().withXPositionProportion(POSITION_X).withYPositionProportion(POSITION_Y);
