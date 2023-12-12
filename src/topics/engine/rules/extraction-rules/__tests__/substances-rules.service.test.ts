import type { SpyInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { IConcentration, IExtractedSubstance, IFdsTree, ILine, IStroke } from '@topics/engine/model/fds.model.js';
import { SubstancesRulesService } from '@topics/engine/rules/extraction-rules/substances-rules.service.js';
import { CONCENTRATION_VALUE } from '@topics/engine/__fixtures__/fixtures.constants.js';
import {
  aFdsTree,
  aFdsTreeWithAllSectionsWithUsefulInfo,
  aFdsTreeWithAllSectionsWithoutUsefulInfo,
} from '@topics/engine/__fixtures__/fds-tree.mother.js';
import { CasAndCeRulesService } from '@topics/engine/rules/extraction-rules/substance/cas-and-ce-rules.service.js';
import { ConcentrationRulesService } from '@topics/engine/rules/extraction-rules/substance/concentration-rules.service.js';
import {
  aSubstanceWithCasAndCeNumber,
  aSubstanceWithOnlyACasNumber,
  aSubstanceWithOnlyACeNumber,
} from '@topics/engine/__fixtures__/substance.mother.js';

describe('SubstancesRulesService tests', () => {
  describe('assignConcentrationToSubstance tests', () => {
    it.each<{ message: string; substances: IExtractedSubstance[]; concentrations: IConcentration[]; expected: IExtractedSubstance[] }>([
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
        concentrations: [CONCENTRATION_VALUE, CONCENTRATION_VALUE + 1],
        expected: [
          aSubstanceWithOnlyACasNumber().withConcentration(CONCENTRATION_VALUE).properties,
          aSubstanceWithOnlyACeNumber().withConcentration(CONCENTRATION_VALUE + 1).properties,
        ],
      },
      {
        message: 'should return substances without concentrations when there is not exactly the same number of concentrations as substances',
        substances: [aSubstanceWithOnlyACasNumber().properties, aSubstanceWithOnlyACeNumber().properties],
        concentrations: [CONCENTRATION_VALUE, CONCENTRATION_VALUE + 1, CONCENTRATION_VALUE + 2],
        expected: [aSubstanceWithOnlyACasNumber().properties, aSubstanceWithOnlyACeNumber().properties],
      },
    ])('$message', ({ substances, concentrations, expected }) => {
      expect(SubstancesRulesService.assignConcentrationToSubstance(substances, concentrations)).toEqual(expected);
    });
  });

  describe('GetSubstances tests', () => {
    let getSubstancesCasAndCeSpy: SpyInstance<[lines: ILine[]], Pick<IExtractedSubstance, 'casNumber' | 'ceNumber'>[]>;
    let getConcentrationsSpy: SpyInstance<[line: ILine[], { strokes: IStroke[] }], IConcentration[]>;
    let assignConcentrationToSubstanceSpy: SpyInstance<[substances: IExtractedSubstance[], concentration: IConcentration[]], IExtractedSubstance[]>;

    beforeEach(() => {
      getSubstancesCasAndCeSpy = vi.spyOn(CasAndCeRulesService, 'getSubstancesCasAndCe');
      getConcentrationsSpy = vi.spyOn(ConcentrationRulesService, 'getConcentrations');
      assignConcentrationToSubstanceSpy = vi.spyOn(SubstancesRulesService, 'assignConcentrationToSubstance');
    });

    afterEach(() => {
      getSubstancesCasAndCeSpy.mockRestore();
      getConcentrationsSpy.mockRestore();
      assignConcentrationToSubstanceSpy.mockRestore();
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
        expected: [aSubstanceWithCasAndCeNumber().withConcentration(CONCENTRATION_VALUE).properties],
      },
    ])('$message', ({ fdsTree, expected }) => {
      expect(SubstancesRulesService.getSubstances(fdsTree)).toEqual(expected);
      expect(getSubstancesCasAndCeSpy).toHaveBeenCalledOnce();
      expect(getConcentrationsSpy).toHaveBeenCalledOnce();
      expect(assignConcentrationToSubstanceSpy).toHaveBeenCalledOnce();
    });
  });
});
