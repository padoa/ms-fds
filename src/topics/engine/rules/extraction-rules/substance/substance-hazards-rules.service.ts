import _ from 'lodash';
import type { IExtractedDanger } from '@padoa/chemical-risk';

import { HAZARDS_REGEX } from '@topics/engine/rules/extraction-rules/dangers.regex.js';
import type { IText } from '@topics/engine/model/fds.model.js';
import { ExtractionToolsService } from '@topics/engine/rules/extraction-rules/extraction-tools.service.js';

export class SubstanceHazardsRulesService {
  public static getHazards(linesSplittedByColumns: IText[][][]): IExtractedDanger[] {
    const hazardsByColumns = _.map(linesSplittedByColumns, (lines) => this.getHazardsInColumn(lines));
    return _.maxBy(hazardsByColumns, 'length');
  }

  public static getHazardsInColumn(lines: IText[][]): IExtractedDanger[] {
    return _(lines)
      .map((texts) => {
        const { cleanText, rawText } = texts.reduce(
          (joinedTexts, { cleanContent, rawContent }) => ({
            cleanText: joinedTexts.cleanText + cleanContent,
            rawText: joinedTexts.rawText + rawContent,
          }),
          { cleanText: '', rawText: '' },
        );
        const hazardsCodes = ExtractionToolsService.getAllRawTextMatchingRegExp({ rawText, cleanText, regExp: new RegExp(HAZARDS_REGEX, 'g') });
        return _.map(hazardsCodes, (code) => ({
          code: _.trim(code),
          metaData: { startBox: _.pick(texts[0], ['pageNumber', 'xPositionProportion', 'yPositionProportion']) },
        }));
      })
      .flatten()
      .uniqBy('code')
      .value();
  }
}
