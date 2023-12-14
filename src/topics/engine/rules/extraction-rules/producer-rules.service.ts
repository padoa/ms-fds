import _ from 'lodash';

import type { IFdsTree, IExtractedProducer } from '@topics/engine/model/fds.model.js';
import { ExtractionCleanerService } from '@topics/engine/rules/extraction-cleaner.service.js';

export class ProducerRulesService {
  public static getProducer(fdsTree: IFdsTree): IExtractedProducer | null {
    const linesToSearchIn = fdsTree[1]?.subsections?.[3]?.lines;

    if (_.isEmpty(linesToSearchIn)) return null;

    for (const line of linesToSearchIn) {
      const { cleanContent } = _.last(line.texts) || { cleanContent: '' };
      const text = _(cleanContent).split(':').last().trim();
      if (!text) continue;

      if (
        _.includes(text, 'fournisseur') ||
        _.includes(text, '1.3') ||
        _.includes(text, '1. 3') ||
        _.includes(text, 'société') ||
        _.includes(text, 'données de sécurité') ||
        _.includes(text, 'raison sociale')
      ) {
        continue;
      }

      const { startBox, endBox } = line;

      return { name: ExtractionCleanerService.trimAndCleanTrailingDot(text), metaData: { startBox, endBox } };
    }
    return null;
  }
}
