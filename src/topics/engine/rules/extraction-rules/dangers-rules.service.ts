import _ from 'lodash';

import type { IFdsTree, IExtractedDanger } from '@topics/engine/model/fds.model.js';

export class DangersRulesService {
  private static readonly customHazards = ['h\\s*350i', 'h\\s*360f', 'h\\s*360d', 'h\\s*360fd', 'h\\s*360df', 'h\\s*361f', 'h\\s*361d', 'h\\s*361fd'];

  // TODO: add unit tests on regexes
  public static readonly hazardsRegex = `(${this.customHazards.join(')|(')})|(h\\s*[2-4]\\d{2})`;
  public static readonly precautionRegex = '(((p\\s*[1-5]\\d{2})\\s*\\+?\\s*)+)';
  public static readonly europeanHazardsRegex = '(euh\\s*[02]\\d{2})|(euh\\s*401)';

  public static getDangers(fdsTree: IFdsTree): IExtractedDanger[] {
    const linesToSearchIn = fdsTree[2]?.subsections?.[2]?.lines;
    const infoInEachLine = _.map(linesToSearchIn, ({ texts, pageNumber, startBox, endBox }) => {
      const textContent = _.map(texts, (text) => text.content).join('');
      return { text: textContent, pageNumber, startBox, endBox };
    });

    // TODO: possible improvement: concat all lines then use regex once to extract dangers
    return _(infoInEachLine)
      .map((lineInfo) => {
        const { text: lineText, pageNumber, startBox, endBox } = lineInfo;
        const textMatches = lineText.match(new RegExp(`${this.europeanHazardsRegex}|${this.hazardsRegex}|${this.precautionRegex}`, 'g')) || [];
        return textMatches.map((text) => ({ code: _.trim(text), metaData: { pageNumber, startBox, endBox } }));
      })
      .flatMap()
      .compact()
      .value();
  }
}
