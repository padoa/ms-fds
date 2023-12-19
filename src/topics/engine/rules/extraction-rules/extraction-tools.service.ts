import _ from 'lodash';

import type { IGetTextMatchingRegExpOptions, IJoinedTexts, IMatchedText } from '@topics/engine/rules/extraction-rules/extraction-rules.model.js';
import type { ILine, IText } from '@topics/engine/model/fds.model.js';

export class ExtractionToolsService {
  public static MAX_MATCH_ITERATIONS: number = 50;

  /**
   * capturingGroup starts at 1
   */
  public static getAllTextsMatchingRegExp(regExp: RegExp, { rawText, cleanText, capturingGroup }: IGetTextMatchingRegExpOptions): IMatchedText[] {
    if (!regExp.global) throw new Error('RegExp must be global');

    const matches: IMatchedText[] = [];
    for (let i = 0; i < this.MAX_MATCH_ITERATIONS; i += 1) {
      const match = this.getTextMatchingRegExp(regExp, { rawText, cleanText, capturingGroup });
      if (!match) return matches;

      matches.push(match);
    }

    return matches;
  }

  /**
   * capturingGroup starts at 1
   */
  public static getTextMatchingRegExp(regExp: RegExp, { rawText, cleanText, capturingGroup }: IGetTextMatchingRegExpOptions): IMatchedText | null {
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

  // TODO: add tests
  public static getTextValueByText(line: ILine): IMatchedText {
    const { cleanContent, rawContent } = _.last(line.texts) || { cleanContent: '', rawContent: '' };
    return {
      cleanText: this.extractValueFromText(cleanContent),
      rawText: this.extractValueFromText(rawContent),
    };
  }

  private static extractValueFromText(text: string): string {
    return _(text).split(':').last().trim();
  }

  // TODO: add tests
  public static getJoinedTexts(texts: IText[]): IJoinedTexts {
    return texts.reduce(
      (joinedTexts, { cleanContent, rawContent }) => ({
        cleanText: joinedTexts.cleanText + cleanContent,
        rawText: joinedTexts.rawText + rawContent,
      }),
      { cleanText: '', rawText: '' },
    );
  }
}
