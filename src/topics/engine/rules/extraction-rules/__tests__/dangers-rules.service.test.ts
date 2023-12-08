import { describe, expect, it } from 'vitest';

import { anEmptyFdsTreeWithAllSections, aFdsTreeWithAllSectionsWithoutUsefulInfo, aFdsTree } from '@topics/engine/__fixtures__/fds-tree.mother.js';
import {
  H_DANGER,
  EUH_DANGER,
  P_DANGER,
  MULTIPLE_P_DANGER,
  POSITION_PROPORTION_X,
  POSITION_PROPORTION_Y,
} from '@topics/engine/__fixtures__/fixtures.constants.js';
import { aLineWithHDanger, aLineWithEUHDanger, aLineWithTwoDangers, aLineWithMultiplePDanger } from '@topics/engine/__fixtures__/line.mother.js';
import { aSection } from '@topics/engine/__fixtures__/section.mother.js';
import { aSubSection } from '@topics/engine/__fixtures__/sub-section.mother.js';
import type { IFdsTree, IExtractedDanger, IBox, IMetaData } from '@topics/engine/model/fds.model.js';
import { DangersRulesService } from '@topics/engine/rules/extraction-rules/dangers-rules.service.js';

describe('DangersRulesService tests', () => {
  const iBox: IBox = { xPositionProportion: POSITION_PROPORTION_X, yPositionProportion: POSITION_PROPORTION_Y };
  const metaData: IMetaData = { pageNumber: 1, startBox: iBox, endBox: undefined };

  describe('GetDangers tests', () => {
    it.each<[{ message: string; fdsTree: IFdsTree; expected: IExtractedDanger[] }]>([
      [{ message: 'it should return null when providing an empty fdsTree', fdsTree: anEmptyFdsTreeWithAllSections().properties, expected: [] }],
      [
        {
          message: 'it should return an empty list when providing texts without dangers',
          fdsTree: aFdsTreeWithAllSectionsWithoutUsefulInfo().properties,
          expected: [],
        },
      ],
      [
        {
          message: 'it should retrieve dangers contained in lines',
          fdsTree: aFdsTree().withSection2(
            aSection().withSubsections({
              2: aSubSection().withLines([aLineWithHDanger().properties, aLineWithEUHDanger().properties]).properties,
            }).properties,
          ).properties,
          expected: [
            { code: H_DANGER, metaData },
            { code: EUH_DANGER, metaData },
          ],
        },
      ],
      [
        {
          message: 'it should retrieve dangers contained in texts and lines',
          fdsTree: aFdsTree().withSection2(
            aSection().withSubsections({
              2: aSubSection().withLines([aLineWithTwoDangers().properties, aLineWithMultiplePDanger().properties]).properties,
            }).properties,
          ).properties,
          expected: [
            { code: H_DANGER, metaData },
            { code: P_DANGER, metaData },
            { code: MULTIPLE_P_DANGER, metaData },
          ],
        },
      ],
    ])('$message', ({ fdsTree, expected }) => {
      expect(DangersRulesService.getDangers(fdsTree)).toEqual(expected);
    });
  });
});
