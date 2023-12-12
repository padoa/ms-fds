import { SubstanceBuilder } from '@topics/engine/__fixtures__/substance.builder.js';

export const aSubstance = (): SubstanceBuilder => new SubstanceBuilder();

export const aSubstanceWithCasAndCeNumber = (): SubstanceBuilder => aSubstance().withConcentration(undefined);
export const aSubstanceWithOnlyACasNumber = (): SubstanceBuilder => aSubstance().withCeNumber(undefined).withConcentration(undefined);
export const aSubstanceWithOnlyACeNumber = (): SubstanceBuilder => aSubstance().withCasNumber(undefined).withConcentration(undefined);
