import { SubstanceBuilder } from '@topics/engine/rules/extraction-rules/__tests__/__fixtures__/substance.builder.js';

export const aSubstance = (): SubstanceBuilder => new SubstanceBuilder();

export const aSubstanceWithCasAndCeNumber = (): SubstanceBuilder => aSubstance().withConcentration(undefined).withHazards(undefined);
export const aSubstanceWithOnlyACasNumber = (): SubstanceBuilder =>
  aSubstance().withCeNumber(undefined).withConcentration(undefined).withHazards(undefined);
export const aSubstanceWithOnlyACeNumber = (): SubstanceBuilder =>
  aSubstance().withCasNumber(undefined).withConcentration(undefined).withHazards(undefined);

export const aSubstanceWithoutHazards = (): SubstanceBuilder => aSubstance().withHazards(undefined);
