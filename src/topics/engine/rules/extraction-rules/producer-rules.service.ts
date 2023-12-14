import _ from 'lodash';

import type { IFdsTree, IExtractedProducer, ILine } from '@topics/engine/model/fds.model.js';
import { TextCleanerService } from '@topics/engine/text-cleaner.service.js';

export class ProducerRulesService {
  public static getProducer(fdsTree: IFdsTree): IExtractedProducer | null {
    const linesToSearchIn = fdsTree[1]?.subsections?.[3]?.lines;

    if (_.isEmpty(linesToSearchIn)) return null;

    for (const line of linesToSearchIn) {
      const { cleanProductText, rawProductText } = this.extractRawAndCleanProductText(line);
      if (!cleanProductText) continue;

      if (
        _.includes(cleanProductText, 'fournisseur') ||
        _.includes(cleanProductText, '1.3') ||
        _.includes(cleanProductText, '1. 3') ||
        _.includes(cleanProductText, 'société') ||
        _.includes(cleanProductText, 'données de sécurité') ||
        _.includes(cleanProductText, 'raison sociale')
      ) {
        continue;
      }

      return { name: TextCleanerService.trimAndCleanTrailingDot(rawProductText), metaData: { startBox: line.startBox, endBox: line.endBox } };
    }
    return null;
  }

  private static extractRawAndCleanProductText(line: ILine): { cleanProductText: string; rawProductText: string } {
    const { cleanContent, rawContent } = _.last(line.texts) || { cleanContent: '', rawContent: '' };
    return {
      cleanProductText: this.extractProductText(cleanContent),
      rawProductText: this.extractProductText(rawContent),
    };
  }

  private static extractProductText(productText: string): string {
    return _(productText).split(':').last().trim();
  }
}
