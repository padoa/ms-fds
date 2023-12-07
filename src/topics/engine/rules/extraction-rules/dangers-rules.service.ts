import _ from 'lodash';

import type { IFDSTree, IExtractedDanger } from '@topics/engine/model/fds.model.js';

export class DangersRulesService {
  private static readonly customHazards = ['h350i', 'h360f', 'h360d', 'h360fd', 'h360df', 'h361f', 'h361d', 'h361fd'];

  // TODO: add unit tests on regexes
  public static readonly hazardsRegex = `(${this.customHazards.join(')|(')})|(h[2-4]\\d{2})`;
  public static readonly precautionRegex = '(((p[1-5]\\d{2})\\+?)+)';
  public static readonly europeanHazardsRegex = '(euh[02]\\d{2})|(euh401)';

  public static getDangers(fdsTree: IFDSTree): IExtractedDanger[] {
    const linesToSearchIn = fdsTree[2]?.subsections?.[2]?.lines;
    const textInEachLine = _.map(linesToSearchIn, ({ texts }) => _.map(texts, 'content').join(''));

    // TODO: possible improvement: concat all lines then use regex once to extract dangers
    return _(textInEachLine)
      .map((text) => {
        const textMatches =
          text.replaceAll(' ', '').match(new RegExp(`${this.europeanHazardsRegex}|${this.hazardsRegex}|${this.precautionRegex}`, 'g')) || [];
        return textMatches.map((t) => t.replaceAll('+', ' + '));
      })
      .flatMap()
      .compact()
      .value();
  }
}
