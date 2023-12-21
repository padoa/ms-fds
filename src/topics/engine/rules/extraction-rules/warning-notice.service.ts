import _ from 'lodash';
import { ProductWarningNotice } from '@padoa/chemical-risk';
import type { IExtractedWarningNotice } from '@padoa/chemical-risk';

import type { IFdsTree, ILine } from '@topics/engine/model/fds.model.js';
import { ExtractionToolsService } from '@topics/engine/rules/extraction-rules/extraction-tools.service.js';
import type { IMatchedText } from '@topics/engine/rules/extraction-rules/extraction-rules.model.js';
import { CommonRegexRulesService } from '@topics/engine/rules/extraction-rules/common-regex-rules.service.js';

export class WarningNoticeService {
  private static readonly SPACE_REGEX = CommonRegexRulesService.SPACE_REGEX;

  public static readonly WARNING_NOTICE_IDENTIFIER_REGEX: RegExp = new RegExp(
    `mention[s]?${this.SPACE_REGEX}d${this.SPACE_REGEX}[']?${this.SPACE_REGEX}averti[s]?sem[ae]nt`,
  );

  public static readonly WARNING_NOTICE_VALUE_REGEX_MAPPING: { [warningNotice in ProductWarningNotice]: RegExp } = {
    [ProductWarningNotice.DANGER]: new RegExp(`(?<!mention[s]?${this.SPACE_REGEX}de${this.SPACE_REGEX})danger`),
    [ProductWarningNotice.WARNING]: /a[t]?t[ae]ntion/,
    [ProductWarningNotice.NONE]: new RegExp(`(aucun|n[eé]ant|pas${this.SPACE_REGEX}de${this.SPACE_REGEX}mention)`),
  };

  public static getWarningNotice(fdsTree: IFdsTree): IExtractedWarningNotice | null {
    const linesToSearchIn = fdsTree[2]?.subsections?.[2]?.lines;
    if (_.isEmpty(linesToSearchIn)) return null;

    return this.getWarningNoticeByIdentifier(linesToSearchIn);
  }

  public static getWarningNoticeByIdentifier(linesToSearchIn: ILine[]): IExtractedWarningNotice | null {
    let warningValueNoticeInCurrentLine = false;
    for (const line of linesToSearchIn) {
      const { texts, startBox, endBox } = line;

      const { rawText, cleanText } = ExtractionToolsService.getJoinedTexts(texts);

      const warningNoticeInLine = !!cleanText.match(this.WARNING_NOTICE_IDENTIFIER_REGEX);
      if (!warningNoticeInLine && !warningValueNoticeInCurrentLine) continue;

      const warningNotice = this.extractWarningNotice(rawText, cleanText);

      if (warningNotice) {
        return { rawValue: warningNotice.rawText, value: warningNotice.enumValue, metaData: { startBox, endBox } };
      }

      warningValueNoticeInCurrentLine = warningNoticeInLine;
    }

    return null;
  }

  private static extractWarningNotice(rawText: string, cleanText: string): (IMatchedText & { enumValue: ProductWarningNotice }) | null {
    for (const [warningNoticeValue, warningNoticeValueRegex] of Object.entries(this.WARNING_NOTICE_VALUE_REGEX_MAPPING)) {
      const matchedWarningNotice = ExtractionToolsService.getTextMatchingRegExp(warningNoticeValueRegex, {
        rawText,
        cleanText,
      });

      if (matchedWarningNotice) {
        return { ...matchedWarningNotice, enumValue: warningNoticeValue as ProductWarningNotice };
      }
    }

    return null;
  }
}
