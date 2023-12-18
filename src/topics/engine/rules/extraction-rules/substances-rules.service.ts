import _ from 'lodash';
import type { IExtractedConcentration, IExtractedDanger, IExtractedSubstance, IPosition } from '@padoa/chemical-risk';

import type { IFdsTree } from '@topics/engine/model/fds.model.js';
import { CasAndCeRulesService } from '@topics/engine/rules/extraction-rules/substance/cas-and-ce-rules.service.js';
import { ConcentrationRulesService } from '@topics/engine/rules/extraction-rules/substance/concentration-rules.service.js';
import { SubstanceHazardsRulesService } from '@topics/engine/rules/extraction-rules/substance/substance-hazards-rules.service.js';
import { TableExtractionService } from '@topics/engine/rules/extraction-rules/substance/table-extraction.service.js';

export class SubstancesRulesService {
  public static getSubstances(fdsTree: IFdsTree): IExtractedSubstance[] {
    const linesToSearchIn = [...(fdsTree[3]?.subsections?.[1]?.lines || []), ...(fdsTree[3]?.subsections?.[2]?.lines || [])];
    const strokes = [...(fdsTree[3]?.subsections?.[1]?.strokes || []), ...(fdsTree[3]?.subsections?.[2]?.strokes || [])];
    const substancesCasAndCe = CasAndCeRulesService.getSubstancesCasAndCe(linesToSearchIn);

    const tableVerticalStrokes = TableExtractionService.getTableVerticalStrokes(strokes);
    const linesSplittedByColumns = TableExtractionService.splitLinesInColumns(linesToSearchIn, tableVerticalStrokes);

    const concentrations = ConcentrationRulesService.getConcentrations(linesSplittedByColumns);
    const substancesWithConcentrations = this.assignConcentrationsToSubstances(substancesCasAndCe, concentrations);

    const hazards = SubstanceHazardsRulesService.getHazards(linesSplittedByColumns);
    return this.assignHazardsToSubstances(substancesWithConcentrations, hazards);
  }

  public static assignConcentrationsToSubstances(
    substances: IExtractedSubstance[],
    concentrations: IExtractedConcentration[],
  ): IExtractedSubstance[] {
    const nbConcentrationsAndSubstancesMatches = concentrations.length === substances.length;
    return nbConcentrationsAndSubstancesMatches
      ? _.zipWith(substances, concentrations, (substance, concentration) => ({ ...substance, concentration }))
      : substances;
  }

  public static assignHazardsToSubstances(substances: IExtractedSubstance[], hazards: IExtractedDanger[]): IExtractedSubstance[] {
    if (_.isEmpty(substances) || _.isEmpty(hazards)) return substances;

    _.forEach(hazards, (hazard) => {
      const closestSubstanceAboveHazard = _.findLast(substances, (substance) => this.isBelow(hazard, substance));
      if (closestSubstanceAboveHazard) closestSubstanceAboveHazard.hazards = [...(closestSubstanceAboveHazard.hazards || []), hazard];
    });
    return substances;
  }

  private static isBelow(hazard: IExtractedDanger, substance: IExtractedSubstance): boolean {
    const highestSubstancePosition = this.computeHighestSubstancePosition(substance);
    const hazardPosition = hazard.metaData.startBox;

    if (hazardPosition.pageNumber !== highestSubstancePosition.pageNumber) return hazardPosition.pageNumber > highestSubstancePosition.pageNumber;
    return hazardPosition.yPositionProportion >= highestSubstancePosition.yPositionProportion;
  }

  private static computeHighestSubstancePosition(substance: IExtractedSubstance): IPosition {
    const positions: IPosition[] = _(substance).map('metaData.startBox').compact().value();
    return _.minBy(positions, (position) => position.pageNumber * 100 + position.yPositionProportion);
  }
}
