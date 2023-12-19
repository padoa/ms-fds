import _ from 'lodash';
import type { IExtractedWarningNotice } from '@padoa/chemical-risk';

import type { IFdsTree, ILine } from '@topics/engine/model/fds.model.js';
import { ExtractionToolsService } from '@topics/engine/rules/extraction-rules/extraction-tools.service.js';

export class WarningNoticeService {
  public static readonly WARNING_NOTICE_IDENTIFIER_REGEX: RegExp = /mention d'avertissement/; // TODO: improve identifier
  public static readonly WARNING_NOTICE_VALUE_REGEX: RegExp = /(danger|attention)/; // TODO: improve identifier

  public static getWarningNotice(fdsTree: IFdsTree): IExtractedWarningNotice | null {
    const linesToSearchIn = fdsTree[2]?.subsections?.[2]?.lines;
    if (_.isEmpty(linesToSearchIn)) return null;

    return this.getWarningNoticeByValue(linesToSearchIn);
  }

  public static getWarningNoticeByValue(linesToSearchIn: ILine[]): IExtractedWarningNotice | null {
    let warningNoticeInCurrentLine = false;
    for (const line of linesToSearchIn) {
      const { texts, startBox, endBox } = line;

      const { rawText, cleanText } = ExtractionToolsService.getJoinedTexts(texts);

      const warningNoticeInLine = !!cleanText.match(this.WARNING_NOTICE_IDENTIFIER_REGEX);
      if (!warningNoticeInLine && !warningNoticeInCurrentLine) continue;

      const warningNotice = ExtractionToolsService.getTextMatchingRegExp(this.WARNING_NOTICE_VALUE_REGEX, { rawText, cleanText });
      if (!warningNotice) {
        warningNoticeInCurrentLine = warningNoticeInLine;
        continue;
      }

      return { value: warningNotice.rawText, metaData: { startBox, endBox } };
    }

    return null;
  }
}
