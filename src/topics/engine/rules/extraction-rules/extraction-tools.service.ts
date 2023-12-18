import _ from 'lodash';

import type { IGetRawTextMatchingRegExp } from '@topics/engine/rules/extraction-rules/extraction-rules.model.js';

export class ExtractionToolsService {
  public static getAllRawTextMatchingRegExp({ rawText, cleanText, regExp }: IGetRawTextMatchingRegExp): string[] {
    if (!regExp.global) throw new Error('RegExp must be global');

    const matches: string[] = [];
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const match = this.getRawTextMatchingRegExp({ rawText, cleanText, regExp });
      if (!match) return matches;

      matches.push(match);
    }
  }

  public static getRawTextMatchingRegExp({ rawText, cleanText, regExp }: IGetRawTextMatchingRegExp): string | null {
    const regExpMatch = regExp.exec(cleanText);
    if (!regExpMatch) return null;

    return _.trim(rawText.substring(regExpMatch.index, regExpMatch.index + regExpMatch[0].length));
  }
}
