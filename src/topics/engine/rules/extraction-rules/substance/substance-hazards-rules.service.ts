import _ from 'lodash';

import type { IExtractedDanger, IText } from '@topics/engine/model/fds.model.js';
import { HAZARDS_REGEX } from '@topics/engine/rules/extraction-rules/dangers.regex.js';

export class SubstanceHazardsRulesService {
  public static getHazards(linesSplittedByColumns: IText[][][]): IExtractedDanger[] {
    const hazardsByColumns = _.map(linesSplittedByColumns, (lines) => this.getHazardsInColumn(lines));
    return _.maxBy(hazardsByColumns, 'length');
  }

  public static getHazardsInColumn(lines: IText[][]): IExtractedDanger[] {
    return _(lines)
      .map((texts) => {
        const text = texts.map(({ content }) => content).join('');
        const hazardsCodes = this.getHazardsCodes(text);
        return _.map(hazardsCodes, (code) => ({
          code: _.trim(code),
          metaData: { startBox: _.pick(texts[0], ['pageNumber', 'xPositionProportion', 'yPositionProportion']) },
        }));
      })
      .flatten()
      .uniqBy('code')
      .value();
  }

  public static getHazardsCodes(text: string): string[] {
    return text.match(new RegExp(HAZARDS_REGEX, 'g')) || [];
  }
}
