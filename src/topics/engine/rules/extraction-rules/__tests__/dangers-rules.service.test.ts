import { describe, expect, it } from 'vitest';

import { anEmptyFdsTreeWithAllSections, aFdsTreeWithAllSectionsWithoutUsefulInfo, aFdsTree } from '@topics/engine/__fixtures__/fds-tree.mother.js';
import { H_DANGER, EUH_DANGER, P_DANGER, MULTIPLE_P_DANGER } from '@topics/engine/__fixtures__/fixtures.constants.js';
import { aLineWithHDanger, aLineWithEUHDanger, aLineWithTwoDangers, aLineWithMultiplePDanger } from '@topics/engine/__fixtures__/line.mother.js';
import { aSection } from '@topics/engine/__fixtures__/section.mother.js';
import { aSubSection } from '@topics/engine/__fixtures__/sub-section.mother.js';
import type { IFdsTree, IExtractedDanger, IMetaData } from '@topics/engine/model/fds.model.js';
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
