import { describe, expect, it } from 'vitest';

import type { IExtractedData, IMetaData } from '@topics/engine/model/fds.model.js';
import { aFdsTreeWithAllSectionsWithUsefulInfo } from '@topics/engine/__fixtures__/fds-tree.mother.js';
import {
  PRODUCT_NAME,
  PRODUCT_IDENTIFIER_WITH_COLON,
  PRODUCER_NAME,
  H_DANGER,
  P_DANGER,
  MULTIPLE_P_DANGER,
  PRODUCER_IDENTIFIER_WITH_COLON,
  CAS_NUMBER_TEXT,
  CE_NUMBER_TEXT,
  H_DANGER_WITH_DETAILS,
  MULTIPLE_P_DANGER_WITH_DETAILS,
  PHYSICAL_STATE_VALUE,
  VAPOR_PRESSURE_TEMPERATURE,
  VAPOR_PRESSURE_VALUE,
  PHYSICAL_STATE_IDENTIFIER,
  VAPOR_PRESSURE_IDENTIFIER_WITH_TEMPERATURE,
  BOILING_POINT_IDENTIFIER,
  BOILING_POINT_VALUE,
  CONCENTRATION_VALUE,
} from '@topics/engine/__fixtures__/fixtures.constants.js';
import { ExtractionRulesService } from '@topics/engine/rules/extraction-rules.service.js';
import { aPosition } from '@topics/engine/__fixtures__/position.mother.js';
import { aSubstance } from '@topics/engine/__fixtures__/substance.mother.js';

describe('ExtractionRulesService tests', () => {
  const metaData: IMetaData = { startBox: aPosition().properties };

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
      ${CONCENTRATION_VALUE}
      ${PHYSICAL_STATE_IDENTIFIER}
      ${PHYSICAL_STATE_VALUE}
      ${VAPOR_PRESSURE_IDENTIFIER_WITH_TEMPERATURE}
      ${VAPOR_PRESSURE_VALUE}
      ${BOILING_POINT_IDENTIFIER}
      ${BOILING_POINT_VALUE}
    `;

      const expected: IExtractedData = {
        date: { formattedDate: '2015/05/18', inTextDate: '18/05/2015' },
        product: { name: PRODUCT_NAME, metaData },
        producer: { name: PRODUCER_NAME, metaData },
        dangers: [
          { code: H_DANGER, metaData },
          { code: P_DANGER, metaData },
          { code: MULTIPLE_P_DANGER, metaData },
        ],
        substances: [aSubstance().properties],
        physicalState: { value: PHYSICAL_STATE_VALUE, metaData },
        vaporPressure: { pressure: VAPOR_PRESSURE_VALUE, temperature: VAPOR_PRESSURE_TEMPERATURE, metaData },
        boilingPoint: { value: BOILING_POINT_VALUE, metaData },
      };

      await expect(ExtractionRulesService.extract({ fdsTreeCleaned: aFdsTreeWithAllSectionsWithUsefulInfo().properties, fullText })).resolves.toEqual(
        expected,
      );
    });
  });
});
