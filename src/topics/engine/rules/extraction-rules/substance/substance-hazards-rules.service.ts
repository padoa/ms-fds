import _ from 'lodash';
import type { IExtractedDanger } from '@padoa/chemical-risk';

import type { IText } from '@topics/engine/model/fds.model.js';
import { ExtractionToolsService } from '@topics/engine/rules/extraction-rules/extraction-tools.service.js';
import { HAZARDS_REGEX } from '@topics/engine/rules/extraction-rules/dangers.regex.js';

export class SubstanceHazardsRulesService {
  public static getHazards(linesSplittedByColumns: IText[][][]): IExtractedDanger[] {
    const hazardsByColumns = _.map(linesSplittedByColumns, (lines) => this.getHazardsInColumn(lines));
    return _.maxBy(hazardsByColumns, 'length');
  }

  public static getHazardsInColumn(lines: IText[][]): IExtractedDanger[] {
    return _(lines)
      .map((texts) => {
        const { cleanText, rawText } = ExtractionToolsService.getJoinedTexts(texts);
        const hazardsCodes = ExtractionToolsService.getAllTextsMatchingRegExp(new RegExp(HAZARDS_REGEX, 'g'), { rawText, cleanText });
        return _.map(hazardsCodes, (code) => ({
          code: _.trim(code.rawText),
          metaData: { startBox: _.pick(texts[0], ['pageNumber', 'xPositionProportion', 'yPositionProportion']) },
        }));
      })
      .flatten()
      .value();
  }
}
