import { describe, expect, it } from 'vitest';

import type { IExtractedData, IMetaData } from '@topics/engine/model/fds.model.js';
import { aFdsTreeWithAllSectionsWithUsefulInfo } from '@topics/engine/__fixtures__/fds-tree.mother.js';
import {
  H_DANGER,
  P_DANGER,
  MULTIPLE_P_DANGER,
  CAS_NUMBER_TEXT,
  CE_NUMBER_TEXT,
  H_DANGER_WITH_DETAILS,
  MULTIPLE_P_DANGER_WITH_DETAILS,
  CLEAN_PHYSICAL_STATE_VALUE,
  VAPOR_PRESSURE_TEMPERATURE,
  VAPOR_PRESSURE_VALUE,
  CLEAN_PHYSICAL_STATE_IDENTIFIER,
  VAPOR_PRESSURE_IDENTIFIER_WITH_TEMPERATURE,
  BOILING_POINT_IDENTIFIER,
  BOILING_POINT_VALUE,
  CONCENTRATION_VALUE,
  RAW_PRODUCT_IDENTIFIER_WITH_COLON,
  RAW_PRODUCT_NAME,
  RAW_PRODUCER_NAME,
  RAW_PRODUCER_IDENTIFIER_WITH_COLON,
} from '@topics/engine/__fixtures__/fixtures.constants.js';
import { ExtractionRulesService } from '@topics/engine/rules/extraction-rules.service.js';
import { aSubstance } from '@topics/engine/rules/extraction-rules/__tests__/__fixtures__/substance.mother.js';
import { aPosition } from '@topics/engine/__fixtures__/position.mother.js';

describe('ExtractionRulesService tests', () => {
  const metaData: IMetaData = { startBox: aPosition().properties };

  describe('ApplyExtractionRules tests', () => {
    it('Should extract all fields from fds', async () => {
      const fullText: string = `
      révision : 18/05/2015
      ${RAW_PRODUCT_IDENTIFIER_WITH_COLON}
      ${RAW_PRODUCT_NAME}
      ${RAW_PRODUCER_IDENTIFIER_WITH_COLON}
      ${RAW_PRODUCER_NAME}
      // TODO: replace all with "raw" constants
      ${H_DANGER_WITH_DETAILS}
      ${MULTIPLE_P_DANGER_WITH_DETAILS}
      ${MULTIPLE_P_DANGER}
      ${CAS_NUMBER_TEXT}
      ${CE_NUMBER_TEXT}
      ${CONCENTRATION_VALUE}
      ${CLEAN_PHYSICAL_STATE_IDENTIFIER}
      ${CLEAN_PHYSICAL_STATE_VALUE}
      ${VAPOR_PRESSURE_IDENTIFIER_WITH_TEMPERATURE}
      ${VAPOR_PRESSURE_VALUE}
      ${BOILING_POINT_IDENTIFIER}
      ${BOILING_POINT_VALUE}
    `;

      const expected: IExtractedData = {
        date: { formattedDate: '2015/05/18', inTextDate: '18/05/2015' },
        product: { name: RAW_PRODUCT_NAME, metaData },
        producer: { name: RAW_PRODUCER_NAME, metaData },
        dangers: [
          { code: H_DANGER, metaData },
          { code: P_DANGER, metaData },
          { code: MULTIPLE_P_DANGER, metaData },
        ],
        substances: [aSubstance().properties],
        physicalState: { value: CLEAN_PHYSICAL_STATE_VALUE, metaData },
        vaporPressure: { pressure: VAPOR_PRESSURE_VALUE, temperature: VAPOR_PRESSURE_TEMPERATURE, metaData },
        boilingPoint: { value: BOILING_POINT_VALUE, metaData },
      };

      await expect(ExtractionRulesService.extract({ fdsTreeCleaned: aFdsTreeWithAllSectionsWithUsefulInfo().properties, fullText })).resolves.toEqual(
        expected,
      );
    });
  });
});
