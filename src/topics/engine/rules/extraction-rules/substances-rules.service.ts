import _ from 'lodash';

import type { IExtractedConcentration, IExtractedSubstance, IFdsTree } from '@topics/engine/model/fds.model.js';
import { CasAndCeRulesService } from '@topics/engine/rules/extraction-rules/substance/cas-and-ce-rules.service.js';
import { ConcentrationRulesService } from '@topics/engine/rules/extraction-rules/substance/concentration-rules.service.js';

export class SubstancesRulesService {
  public static getSubstances(fdsTree: IFdsTree): IExtractedSubstance[] {
    const linesToSearchIn = [...(fdsTree[3]?.subsections?.[1]?.lines || []), ...(fdsTree[3]?.subsections?.[2]?.lines || [])];
    const strokes = [...(fdsTree[3]?.subsections?.[1]?.strokes || []), ...(fdsTree[3]?.subsections?.[2]?.strokes || [])];
    const substancesCasAndCe = CasAndCeRulesService.getSubstancesCasAndCe(linesToSearchIn);
    const concentrations = ConcentrationRulesService.getConcentrations(linesToSearchIn, { strokes });
    const res = this.assignConcentrationToSubstance(substancesCasAndCe, concentrations);
    return res;
  }

  public static assignConcentrationToSubstance(substances: IExtractedSubstance[], concentrations: IExtractedConcentration[]): IExtractedSubstance[] {
    const nbConcentrationsAndSubstancesMatches = concentrations.length === substances.length;
    return nbConcentrationsAndSubstancesMatches
      ? _.zipWith(substances, concentrations, (substance, concentration) => ({ ...substance, concentration }))
      : substances;
  }
}
