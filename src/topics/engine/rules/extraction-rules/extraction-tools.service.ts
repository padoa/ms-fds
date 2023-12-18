import _ from 'lodash';

import type { IGetRawTextMatchingRegExp, IMatchedText } from '@topics/engine/rules/extraction-rules/extraction-rules.model.js';

export class ExtractionToolsService {
  public static MAX_MATCH_ITERATIONS: number = 50;

  public static getAllTextsMatchingRegExp({ rawText, cleanText, regExp, capturingGroup }: IGetRawTextMatchingRegExp): IMatchedText[] {
    if (!regExp.global) throw new Error('RegExp must be global');

    const matches: IMatchedText[] = [];
    for (let i = 0; i < this.MAX_MATCH_ITERATIONS; i += 1) {
      const match = this.getTextMatchingRegExp({ rawText, cleanText, regExp, capturingGroup });
      if (!match) return matches;

      matches.push(match);
    }

    return matches;
  }

  public static getTextMatchingRegExp({ rawText, cleanText, regExp, capturingGroup }: IGetRawTextMatchingRegExp): IMatchedText | null {
    const regExpMatch = regExp.exec(cleanText);
    if (!regExpMatch) return null;

    const startIndex = regExpMatch.index;
    const endIndex = startIndex + regExpMatch[0].length;

    if (!capturingGroup) {
      return { rawText: _.trim(rawText.substring(startIndex, endIndex)), cleanText: _.trim(regExpMatch[0]) };
    }

    if (!regExpMatch[capturingGroup]) throw new Error(`RegExp match has no capturing group ${capturingGroup}`);

    const startOffset = regExpMatch.slice(1, capturingGroup).reduce((offset, match) => offset + match.length, 0);
    return {
      rawText: _.trim(rawText.substring(startIndex + startOffset, endIndex)),
      cleanText: _.trim(regExpMatch[capturingGroup]),
    };
  }
}
