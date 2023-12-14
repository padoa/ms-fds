import _ from 'lodash';
import type { IExtractedDanger } from '@padoa/chemical-risk';

import type { IFdsTree } from '@topics/engine/model/fds.model.js';

export class DangersRulesService {
  private static readonly CUSTOM_HAZARDS_REGEX = ['h\\s*350i', 'h\\s*360f[d]?', 'h\\s*360d[f]?', 'h\\s*361f[d]?', 'h\\s*361d'];

  public static readonly HAZARDS_REGEX = `(${this.CUSTOM_HAZARDS_REGEX.join(')|(')})|(h\\s*[2-4]\\d{2})`;
  public static readonly PRECAUTION_REGEX = '(((p\\s*[1-5]\\d{2})\\s*\\+?\\s*)+)';
  public static readonly EUROPEAN_HAZARDS_REGEX = '(euh\\s*[02]\\d{2})|(euh\\s*401)';

  public static getDangers(fdsTree: IFdsTree): IExtractedDanger[] {
    const linesToSearchIn = fdsTree[2]?.subsections?.[2]?.lines;
    const infoInEachLine = _.map(linesToSearchIn, ({ texts, startBox, endBox }) => {
      const textContent = _.map(texts, (text) => text.cleanContent).join('');
      return { text: textContent, startBox, endBox };
    });

    const dangersRegex = new RegExp(`${this.EUROPEAN_HAZARDS_REGEX}|${this.HAZARDS_REGEX}|${this.PRECAUTION_REGEX}`, 'g');
    return _(infoInEachLine)
      .map((lineInfo) => {
        const { text: lineText, startBox, endBox } = lineInfo;
        const textMatches = lineText.match(dangersRegex) || [];
        return textMatches.map((text) => ({ code: _.trim(text), metaData: { startBox, endBox } }));
      })
      .flatMap()
      .compact()
      .value();
  }
}
