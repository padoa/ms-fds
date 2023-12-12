import type { SpyInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { IConcentration, IExtractedSubstance, IFdsTree, ILine, IStroke } from '@topics/engine/model/fds.model.js';
import { SubstancesRulesService } from '@topics/engine/rules/extraction-rules/substances-rules.service.js';
import { CAS_NUMBER, CAS_NUMBER_TEXT, CE_NUMBER, CE_NUMBER_TEXT, CONCENTRATION_VALUE } from '@topics/engine/__fixtures__/fixtures.constants.js';
import {
  aFdsTree,
  aFdsTreeWithAllSectionsWithUsefulInfo,
  aFdsTreeWithAllSectionsWithoutUsefulInfo,
} from '@topics/engine/__fixtures__/fds-tree.mother.js';
import { CasAndCeRulesService } from '@topics/engine/rules/extraction-rules/substance/cas-and-ce-rules.service.js';
import { ConcentrationRulesService } from '@topics/engine/rules/extraction-rules/substance/concentration-rules.service.js';

describe('SubstancesRulesService tests', () => {
  describe('assignConcentrationToSubstance tests', () => {
    it.each<{ message: string; substances: IExtractedSubstance[]; concentrations: IConcentration[]; expected: IExtractedSubstance[] }>([
      {
        message: 'should return an empty list when when there is no substance',
        substances: [],
        concentrations: [],
        expected: [],
      },
      {
        message: 'should return substances without concentrations when there are substances but no concentration',
        substances: [
          { casNumber: CAS_NUMBER_TEXT, ceNumber: null },
          { casNumber: null, ceNumber: CE_NUMBER_TEXT },
        ],
        concentrations: [],
        expected: [
          { casNumber: CAS_NUMBER_TEXT, ceNumber: null },
          { casNumber: null, ceNumber: CE_NUMBER_TEXT },
        ],
      },
      {
        message: 'should return substances with concentrations',
        substances: [
          { casNumber: CAS_NUMBER_TEXT, ceNumber: null },
          { casNumber: null, ceNumber: CE_NUMBER_TEXT },
        ],
        concentrations: [CONCENTRATION_VALUE, CONCENTRATION_VALUE + 1],
        expected: [
          { casNumber: CAS_NUMBER_TEXT, ceNumber: null, concentration: CONCENTRATION_VALUE },
          { casNumber: null, ceNumber: CE_NUMBER_TEXT, concentration: CONCENTRATION_VALUE + 1 },
        ],
      },
      {
        message: 'should return substances without concentrations when there is not exactly the same number of concentrations as substances',
        substances: [
          { casNumber: CAS_NUMBER_TEXT, ceNumber: null },
          { casNumber: null, ceNumber: CE_NUMBER_TEXT },
        ],
        concentrations: [CONCENTRATION_VALUE, CONCENTRATION_VALUE + 1, CONCENTRATION_VALUE + 2],
        expected: [
          { casNumber: CAS_NUMBER_TEXT, ceNumber: null },
          { casNumber: null, ceNumber: CE_NUMBER_TEXT },
        ],
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
        expected: [{ casNumber: CAS_NUMBER, ceNumber: CE_NUMBER, concentration: CONCENTRATION_VALUE }],
      },
    ])('$message', ({ fdsTree, expected }) => {
      expect(SubstancesRulesService.getSubstances(fdsTree)).toEqual(expected);
      expect(getSubstancesCasAndCeSpy).toHaveBeenCalledOnce();
      expect(getConcentrationsSpy).toHaveBeenCalledOnce();
      expect(assignConcentrationToSubstanceSpy).toHaveBeenCalledOnce();
    });
  });
});
