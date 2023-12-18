import _ from 'lodash';
import type { IExtractedDanger } from '@padoa/chemical-risk';

import type { IFdsTree } from '@topics/engine/model/fds.model.js';
import { ExtractionToolsService } from '@topics/engine/rules/extraction-rules/extraction-tools.service.js';
import { EUROPEAN_HAZARDS_REGEX, HAZARDS_REGEX, PRECAUTION_REGEX } from '@topics/engine/rules/extraction-rules/dangers.regex.js';

export class DangersRulesService {
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

    const dangersRegex = new RegExp(`${EUROPEAN_HAZARDS_REGEX}|${HAZARDS_REGEX}|${PRECAUTION_REGEX}`, 'g');
    return _(infoInEachLine)
      .map((lineInfo) => {
        const { cleanLineText, rawLineText, startBox, endBox } = lineInfo;

        const matches = ExtractionToolsService.getAllTextsMatchingRegExp(dangersRegex, { rawText: rawLineText, cleanText: cleanLineText });
        return matches.map((match) => ({ code: match.rawText, metaData: { startBox, endBox } }));
      })
      .flatMap()
      .compact()
      .value();
  }
}
