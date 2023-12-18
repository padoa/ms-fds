import type { SpyInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { IExtractedConcentration, IExtractedDanger, IExtractedSubstance } from '@padoa/chemical-risk';

import type { IFdsTree, ILine, IText } from '@topics/engine/model/fds.model.js';
import { SubstancesRulesService } from '@topics/engine/rules/extraction-rules/substances-rules.service.js';
import { RAW_CONCENTRATION_VALUE, INCREMENT_VALUE, PAGE_NUMBER, POSITION_PROPORTION_Y } from '@topics/engine/__fixtures__/fixtures.constants.js';
import {
  aFdsTree,
  aFdsTreeWithAllSectionsWithUsefulInfo,
  aFdsTreeWithAllSectionsWithoutUsefulInfo,
} from '@topics/engine/__fixtures__/fds-tree.mother.js';
import { CasAndCeRulesService } from '@topics/engine/rules/extraction-rules/substance/cas-and-ce-rules.service.js';
import {
  aSubstance,
  aSubstanceWithOnlyACasNumber,
  aSubstanceWithOnlyACeNumber,
  aSubstanceWithoutHazards,
} from '@topics/engine/rules/extraction-rules/__tests__/__fixtures__/substance.mother.js';
import { aConcentration } from '@topics/engine/rules/extraction-rules/__tests__/__fixtures__/concentration.mother.js';
import { ConcentrationRulesService } from '@topics/engine/rules/extraction-rules/substance/concentration-rules.service.js';
import { SubstanceHazardsRulesService } from '@topics/engine/rules/extraction-rules/substance/substance-hazards-rules.service.js';
import { aDanger, aHDanger } from '@topics/engine/rules/extraction-rules/__tests__/__fixtures__/danger.mother.js';
import { aCasNumber } from '@topics/engine/rules/extraction-rules/__tests__/__fixtures__/cas-number.mother.js';
import { aPosition } from '@topics/engine/__fixtures__/position.mother.js';
import type { SubstanceBuilder } from '@topics/engine/rules/extraction-rules/__tests__/__fixtures__/substance.builder.js';

describe('SubstancesRulesService tests', () => {
  describe('assignConcentrationToSubstance tests', () => {
    it.each<{ message: string; substances: IExtractedSubstance[]; concentrations: IExtractedConcentration[]; expected: IExtractedSubstance[] }>([
      {
        message: 'should return an empty list when there is no substance',
        substances: [],
        concentrations: [],
        expected: [],
      },
      {
        message: 'should return substances without concentrations when there are substances but no concentration',
        substances: [aSubstanceWithOnlyACasNumber().properties, aSubstanceWithOnlyACeNumber().properties],
        concentrations: [],
        expected: [aSubstanceWithOnlyACasNumber().properties, aSubstanceWithOnlyACeNumber().properties],
      },
      {
        message: 'should return substances with concentrations',
        substances: [aSubstanceWithOnlyACasNumber().properties, aSubstanceWithOnlyACeNumber().properties],
        concentrations: [aConcentration().properties, aConcentration().withValue(RAW_CONCENTRATION_VALUE + 1).properties],
        expected: [
          aSubstanceWithOnlyACasNumber().withConcentration(aConcentration().properties).properties,
          aSubstanceWithOnlyACeNumber().withConcentration(aConcentration().withValue(RAW_CONCENTRATION_VALUE + 1).properties).properties,
        ],
      },
      {
        message: 'should return substances without concentrations when there is not exactly the same number of concentrations as substances',
        substances: [aSubstanceWithOnlyACasNumber().properties, aSubstanceWithOnlyACeNumber().properties],
        concentrations: [
          aConcentration().withValue(RAW_CONCENTRATION_VALUE).properties,
          aConcentration().withValue(RAW_CONCENTRATION_VALUE + 1).properties,
          aConcentration().withValue(RAW_CONCENTRATION_VALUE + 2).properties,
        ],
        expected: [aSubstanceWithOnlyACasNumber().properties, aSubstanceWithOnlyACeNumber().properties],
      },
    ])('$message', ({ substances, concentrations, expected }) => {
      expect(SubstancesRulesService.assignConcentrationsToSubstances(substances, concentrations)).toEqual(expected);
    });
  });

  describe('assignHazardsToSubstances tests', () => {
    const aMetaData1LineBelow = { startBox: aPosition().withYPositionProportion(POSITION_PROPORTION_Y + INCREMENT_VALUE).properties };
    const aMetaData1PageBelow = { startBox: aPosition().withPageNumber(PAGE_NUMBER + 1).properties };
    const aSubstanceStarting1LineBelow = (): SubstanceBuilder =>
      aSubstanceWithOnlyACasNumber().withCasNumber(aCasNumber().withMetaData(aMetaData1LineBelow).properties);
    const aSubstanceStarting1PageBelow = (): SubstanceBuilder =>
      aSubstanceWithOnlyACasNumber().withCasNumber(aCasNumber().withMetaData(aMetaData1PageBelow).properties);

    it.each<{ message: string; substances: IExtractedSubstance[]; hazards: IExtractedDanger[]; expected: IExtractedSubstance[] }>([
      {
        message: 'should return an empty list when there is no substance',
        substances: [],
        hazards: [],
        expected: [],
      },
      {
        message: 'should return substances without hazards when there are substances but no hazards',
        substances: [aSubstanceWithoutHazards().properties],
        hazards: [],
        expected: [aSubstanceWithoutHazards().properties],
      },
      {
        message: 'should return substance with hazards',
        substances: [aSubstanceWithoutHazards().properties],
        hazards: [aHDanger().properties, aDanger().withCode('h300').properties],
        expected: [aSubstance().withHazards([aHDanger().properties, aDanger().withCode('h300').properties]).properties],
      },
      {
        message: 'should return substance with hazards affected to the correct substances when hazards are on multiple lines on the same page',
        substances: [aSubstanceWithoutHazards().properties, aSubstanceStarting1LineBelow().properties],
        hazards: [
          aHDanger().properties,
          aDanger().withCode('h300').properties,
          aDanger().withCode('h400').withMetaData(aMetaData1LineBelow).properties,
        ],
        expected: [
          aSubstance().withHazards([aHDanger().properties, aDanger().withCode('h300').properties]).properties,
          aSubstanceStarting1LineBelow().withHazards([aDanger().withCode('h400').withMetaData(aMetaData1LineBelow).properties]).properties,
        ],
      },
      {
        message: 'should return substance with hazards affected to the correct substances when hazards are on a different page',
        substances: [aSubstanceWithoutHazards().properties, aSubstanceStarting1PageBelow().properties],
        hazards: [
          aHDanger().properties,
          aDanger().withCode('h300').properties,
          aDanger().withCode('h400').withMetaData(aMetaData1PageBelow).properties,
        ],
        expected: [
          aSubstance().withHazards([aHDanger().properties, aDanger().withCode('h300').properties]).properties,
          aSubstanceStarting1PageBelow().withHazards([aDanger().withCode('h400').withMetaData(aMetaData1PageBelow).properties]).properties,
        ],
      },
    ])('$message', ({ substances, hazards, expected }) => {
      expect(SubstancesRulesService.assignHazardsToSubstances(substances, hazards)).toEqual(expected);
    });
  });

  describe('GetSubstances tests', () => {
    let getSubstancesCasAndCeSpy: SpyInstance<[lines: ILine[]], Pick<IExtractedSubstance, 'casNumber' | 'ceNumber'>[]>;
    let getConcentrationsSpy: SpyInstance<[linesSplittedByColumns: IText[][][]], IExtractedConcentration[]>;
    let assignConcentrationsToSubstancesSpy: SpyInstance<
      [substances: IExtractedSubstance[], concentrations: IExtractedConcentration[]],
      IExtractedSubstance[]
    >;
    let getHazardsSpy: SpyInstance<[linesSplittedByColumns: IText[][][]], IExtractedDanger[]>;
    let assignHazardsToSubstancesSpy: SpyInstance<[substances: IExtractedSubstance[], concentrations: IExtractedDanger[]], IExtractedSubstance[]>;

    beforeEach(() => {
      getSubstancesCasAndCeSpy = vi.spyOn(CasAndCeRulesService, 'getSubstancesCasAndCe');
      getConcentrationsSpy = vi.spyOn(ConcentrationRulesService, 'getConcentrations');
      assignConcentrationsToSubstancesSpy = vi.spyOn(SubstancesRulesService, 'assignConcentrationsToSubstances');
      getHazardsSpy = vi.spyOn(SubstanceHazardsRulesService, 'getHazards');
      assignHazardsToSubstancesSpy = vi.spyOn(SubstancesRulesService, 'assignHazardsToSubstances');
    });

    afterEach(() => {
      getSubstancesCasAndCeSpy.mockRestore();
      getConcentrationsSpy.mockRestore();
      assignConcentrationsToSubstancesSpy.mockRestore();
    });

    it.each<{ message: string; fdsTree: IFdsTree; expected: IExtractedSubstance[] }>([
      {
        message: 'should return an empty list when given an empty fdsTree',
        fdsTree: aFdsTree().properties,
        expected: [],
      },
      {
        message: 'should return an empty list when given a fdsTree without useful info',
        fdsTree: aFdsTreeWithAllSectionsWithoutUsefulInfo().properties,
        expected: [],
      },
      {
        message: 'should return substances when given a fdsTree with substances and concentration',
        fdsTree: aFdsTreeWithAllSectionsWithUsefulInfo().properties,
        expected: [aSubstance().properties],
      },
    ])('$message', ({ fdsTree, expected }) => {
      expect(SubstancesRulesService.getSubstances(fdsTree)).toEqual(expected);
      expect(getSubstancesCasAndCeSpy).toHaveBeenCalledOnce();
      expect(getConcentrationsSpy).toHaveBeenCalledOnce();
      expect(assignConcentrationsToSubstancesSpy).toHaveBeenCalledOnce();
      expect(getHazardsSpy).toHaveBeenCalledOnce();
      expect(assignHazardsToSubstancesSpy).toHaveBeenCalledOnce();
    });
  });
});
