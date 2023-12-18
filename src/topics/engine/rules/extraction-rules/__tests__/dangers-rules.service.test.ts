import { describe, expect, it } from 'vitest';
import type { IExtractedDanger, IMetaData } from '@padoa/chemical-risk';

import { anEmptyFdsTreeWithAllSections, aFdsTreeWithAllSectionsWithoutUsefulInfo, aFdsTree } from '@topics/engine/__fixtures__/fds-tree.mother.js';
import { RAW_H_DANGER, RAW_EUH_DANGER, RAW_P_DANGER, RAW_MULTIPLE_P_DANGER } from '@topics/engine/__fixtures__/fixtures.constants.js';
import { aLineWithHDanger, aLineWithEuhDanger, aLineWithTwoDangers, aLineWithMultiplePDanger } from '@topics/engine/__fixtures__/line.mother.js';
import { aSection } from '@topics/engine/__fixtures__/section.mother.js';
import { aSubSection } from '@topics/engine/__fixtures__/sub-section.mother.js';
import type { IFdsTree } from '@topics/engine/model/fds.model.js';
import { DangersRulesService } from '@topics/engine/rules/extraction-rules/dangers-rules.service.js';
import { aPosition } from '@topics/engine/__fixtures__/position.mother.js';

describe('DangersRulesService tests', () => {
  const metaData: IMetaData = { startBox: aPosition().properties };

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
              2: aSubSection().withLines([aLineWithHDanger().properties, aLineWithEuhDanger().properties]).properties,
            }).properties,
          ).properties,
          expected: [
            { code: RAW_H_DANGER, metaData },
            { code: RAW_EUH_DANGER, metaData },
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
            { code: RAW_H_DANGER, metaData },
            { code: RAW_P_DANGER, metaData },
            { code: RAW_MULTIPLE_P_DANGER, metaData },
          ],
        },
      ],
    ])('$message', ({ fdsTree, expected }) => {
      expect(DangersRulesService.getDangers(fdsTree)).toEqual(expected);
    });
  });
});
