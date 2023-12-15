import _ from 'lodash';
import type { IExtractedProducer } from '@padoa/chemical-risk';

import type { IFdsTree, ILine } from '@topics/engine/model/fds.model.js';
import { TextCleanerService } from '@topics/engine/text-cleaner.service.js';

export class ProducerRulesService {
  public static getProducer(fdsTree: IFdsTree): IExtractedProducer | null {
    const linesToSearchIn = fdsTree[1]?.subsections?.[3]?.lines;

    if (_.isEmpty(linesToSearchIn)) return null;

    for (const line of linesToSearchIn) {
      const { cleanProducerText, rawProducerText } = this.extractRawAndCleanProductText(line);
      if (!cleanProducerText) continue;

      if (
        _.includes(cleanProducerText, 'fournisseur') ||
        _.includes(cleanProducerText, '1.3') ||
        _.includes(cleanProducerText, '1. 3') ||
        _.includes(cleanProducerText, 'société') ||
        _.includes(cleanProducerText, 'données de sécurité') ||
        _.includes(cleanProducerText, 'raison sociale')
      ) {
        continue;
      }

      return { name: TextCleanerService.trimAndCleanTrailingDot(rawProducerText), metaData: { startBox: line.startBox, endBox: line.endBox } };
    }
    return null;
  }

  private static extractRawAndCleanProductText(line: ILine): { cleanProducerText: string; rawProducerText: string } {
    const { cleanContent, rawContent } = _.last(line.texts) || { cleanContent: '', rawContent: '' };
    return {
      cleanProducerText: this.extractProductText(cleanContent),
      rawProducerText: this.extractProductText(rawContent),
    };
  }

  private static extractProductText(productText: string): string {
    return _(productText).split(':').last().trim();
  }
}
