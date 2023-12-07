import { describe, expect, it } from 'vitest';

import { applyExtractionRules } from '@topics/engine/rules/extraction-rules.js';
import type { IBox, IExtractedData, IMetaData } from '@topics/engine/model/fds.model.js';
import { aFdsTreeWithAllSectionsWithUsefulInfo } from '@topics/engine/__fixtures__/fds-tree.mother.js';
import {
  POSITION_PROPORTION_X,
  POSITION_PROPORTION_Y,
  PRODUCT_NAME,
  PRODUCT_IDENTIFIER_WITH_COLON,
  PRODUCER_NAME,
  H_DANGER,
  P_DANGER,
  MULTIPLE_P_DANGER,
  CAS_NUMBER,
  CE_NUMBER,
  PRODUCER_IDENTIFIER_WITH_COLON,
  CAS_NUMBER_TEXT,
  CE_NUMBER_TEXT,
  H_DANGER_WITH_DETAILS,
  MULTIPLE_P_DANGER_WITH_DETAILS,
  PHYSICAL_STATE_VALUE,
} from '@topics/engine/__fixtures__/fixtures.constants.js';

describe('ExtractionRulesService tests', () => {
  const iBox: IBox = { xPositionProportion: POSITION_PROPORTION_X, yPositionProportion: POSITION_PROPORTION_Y };
  const metaData: IMetaData = { pageNumber: 1, startBox: iBox, endBox: undefined };

  describe('ApplyExtractionRules tests', () => {
    it('Should extract all fields from fds', async () => {
      const fullText: string = `
      révision : 18/05/2015
      ${PRODUCT_IDENTIFIER_WITH_COLON}
      ${PRODUCT_NAME}
      ${PRODUCER_IDENTIFIER_WITH_COLON}
      ${PRODUCER_NAME}
      ${H_DANGER_WITH_DETAILS}
      ${MULTIPLE_P_DANGER_WITH_DETAILS}
      ${MULTIPLE_P_DANGER}
      ${CAS_NUMBER_TEXT}
      ${CE_NUMBER_TEXT}
    `;

      const expected: IExtractedData = {
        date: { formattedDate: '2015/05/18', inTextDate: '18/05/2015' },
        product: { name: PRODUCT_NAME, metaData },
        producer: { name: PRODUCER_NAME, metaData },
        dangers: [H_DANGER, P_DANGER, MULTIPLE_P_DANGER],
        substances: [{ casNumber: CAS_NUMBER, ceNumber: CE_NUMBER }],
        physicalState: { value: PHYSICAL_STATE_VALUE, metaData },
      };

      await expect(applyExtractionRules({ fdsTreeCleaned: aFdsTreeWithAllSectionsWithUsefulInfo().properties, fullText })).resolves.toEqual(expected);
    });
  });
});
