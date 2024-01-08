import { describe, expect, it } from 'vitest';
import { ProductWarningNotice, type IExtractedData, type IMetaData } from '@padoa/chemical-risk';

import { aFdsTreeWithAllSectionsWithUsefulInfo } from '@topics/engine/__fixtures__/fds-tree.mother.js';
import {
  RAW_H_DANGER,
  RAW_P_DANGER,
  RAW_MULTIPLE_P_DANGER,
  RAW_H_DANGER_WITH_DETAILS,
  RAW_MULTIPLE_P_DANGER_WITH_DETAILS,
  RAW_BOILING_POINT_IDENTIFIER,
  RAW_BOILING_POINT_VALUE,
  RAW_PRODUCT_IDENTIFIER_WITH_COLON,
  RAW_PRODUCT_NAME,
  RAW_PRODUCER_NAME,
  RAW_PRODUCER_IDENTIFIER_WITH_COLON,
  RAW_CAS_NUMBER_TEXT,
  RAW_CE_NUMBER_TEXT,
  RAW_CONCENTRATION_VALUE,
  RAW_PHYSICAL_STATE_IDENTIFIER,
  RAW_PHYSICAL_STATE_VALUE,
  RAW_VAPOR_PRESSURE_IDENTIFIER_WITH_TEMPERATURE,
  RAW_VAPOR_PRESSURE_VALUE,
  RAW_VAPOR_PRESSURE_TEMPERATURE,
  RAW_WARNING_NOTICE_VALUE,
  RAW_WARNING_NOTICE_IDENTIFIER,
} from '@topics/engine/__fixtures__/fixtures.constants.js';
import { ExtractionRulesService } from '@topics/engine/rules/extraction-rules.service.js';
import { aSubstance } from '@topics/engine/rules/extraction-rules/__tests__/__fixtures__/substance.mother.js';
import { aPosition } from '@topics/engine/__fixtures__/position.mother.js';

describe('ExtractionRulesService tests', () => {
  const metaData: IMetaData = { startBox: aPosition().build() };

  describe('ApplyExtractionRules tests', () => {
    it('Should extract all fields from fds', async () => {
      const fullText: string = `
      révision : 18/05/2015
      ${RAW_PRODUCT_IDENTIFIER_WITH_COLON}
      ${RAW_PRODUCT_NAME}
      ${RAW_PRODUCER_IDENTIFIER_WITH_COLON}
      ${RAW_PRODUCER_NAME}
      ${RAW_H_DANGER_WITH_DETAILS}
      ${RAW_MULTIPLE_P_DANGER_WITH_DETAILS}
      ${RAW_MULTIPLE_P_DANGER}
      ${RAW_CAS_NUMBER_TEXT}
      ${RAW_CE_NUMBER_TEXT}
      ${RAW_CONCENTRATION_VALUE}
      ${RAW_PHYSICAL_STATE_IDENTIFIER}
      ${RAW_PHYSICAL_STATE_VALUE}
      ${RAW_VAPOR_PRESSURE_IDENTIFIER_WITH_TEMPERATURE}
      ${RAW_VAPOR_PRESSURE_VALUE}
      ${RAW_BOILING_POINT_IDENTIFIER}
      ${RAW_BOILING_POINT_VALUE}
      ${RAW_WARNING_NOTICE_IDENTIFIER}
      ${RAW_WARNING_NOTICE_VALUE}
    `;

      const expected: IExtractedData = {
        date: { formattedDate: '2015/05/18', inTextDate: '18/05/2015' },
        product: { name: RAW_PRODUCT_NAME, metaData },
        producer: { name: RAW_PRODUCER_NAME, metaData },
        dangers: [
          { code: RAW_H_DANGER, metaData },
          { code: RAW_P_DANGER, metaData },
          { code: RAW_MULTIPLE_P_DANGER, metaData },
        ],
        substances: [aSubstance().build()],
        physicalState: { value: RAW_PHYSICAL_STATE_VALUE, metaData },
        vaporPressure: { pressure: RAW_VAPOR_PRESSURE_VALUE, temperature: RAW_VAPOR_PRESSURE_TEMPERATURE, metaData },
        boilingPoint: { value: RAW_BOILING_POINT_VALUE, metaData },
        warningNotice: { rawValue: RAW_WARNING_NOTICE_VALUE, value: ProductWarningNotice.DANGER, metaData },
      };

      await expect(ExtractionRulesService.extract({ fdsTreeCleaned: aFdsTreeWithAllSectionsWithUsefulInfo().build(), fullText })).resolves.toEqual(
        expected,
      );
    });
  });
});
