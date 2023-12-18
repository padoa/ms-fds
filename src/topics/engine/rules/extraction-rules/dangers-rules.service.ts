import _ from 'lodash';
import type { IExtractedDanger } from '@padoa/chemical-risk';

import type { IFdsTree } from '@topics/engine/model/fds.model.js';
import { ExtractionToolsService } from '@topics/engine/rules/extraction-rules/extraction-tools.service.js';

export class DangersRulesService {
  private static readonly CUSTOM_HAZARDS_REGEX = ['h\\s*350i', 'h\\s*360f[d]?', 'h\\s*360d[f]?', 'h\\s*361f[d]?', 'h\\s*361d'];

  public static readonly HAZARDS_REGEX = `(${this.CUSTOM_HAZARDS_REGEX.join(')|(')})|(h\\s*[2-4]\\d{2})`;
  public static readonly PRECAUTION_REGEX = '(((p\\s*[1-5]\\d{2})\\s*\\+?\\s*)+)';
  public static readonly EUROPEAN_HAZARDS_REGEX = '(euh\\s*[02]\\d{2})|(euh\\s*401)';

  public static getDangers(fdsTree: IFdsTree): IExtractedDanger[] {
    const linesToSearchIn = fdsTree[2]?.subsections?.[2]?.lines;
    const infoInEachLine = _.map(linesToSearchIn, ({ texts, startBox, endBox }) => {
      const { cleanLineText, rawLineText } = texts.reduce(
        (joinedTexts, { cleanContent, rawContent }) => ({
          cleanLineText: joinedTexts.cleanLineText + cleanContent,
          rawLineText: joinedTexts.rawLineText + rawContent,
        }),
        { cleanLineText: '', rawLineText: '' },
      );
      return { cleanLineText, rawLineText, startBox, endBox };
    });

    const dangersRegex = new RegExp(`${this.EUROPEAN_HAZARDS_REGEX}|${this.HAZARDS_REGEX}|${this.PRECAUTION_REGEX}`, 'g');
    return _(infoInEachLine)
      .map((lineInfo) => {
        const { cleanLineText, rawLineText, startBox, endBox } = lineInfo;

        const matches = ExtractionToolsService.getAllTextsMatchingRegExp({ rawText: rawLineText, cleanText: cleanLineText, regExp: dangersRegex });
        return matches.map((match) => ({ code: match.rawText, metaData: { startBox, endBox } }));
      })
      .flatMap()
      .compact()
      .value();
  }
}
