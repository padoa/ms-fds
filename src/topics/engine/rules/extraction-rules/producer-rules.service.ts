import _ from 'lodash';
import type { IExtractedProducer } from '@padoa/chemical-risk';

import type { IFdsTree } from '@topics/engine/model/fds.model.js';
import { TextCleanerService } from '@topics/engine/text-cleaner.service.js';
import { ExtractionToolsService } from '@topics/engine/rules/extraction-rules/extraction-tools.service.js';

export class ProducerRulesService {
  public static getProducer(fdsTree: IFdsTree): IExtractedProducer | null {
    const linesToSearchIn = fdsTree[1]?.subsections?.[3]?.lines;

    if (_.isEmpty(linesToSearchIn)) return null;

    for (const line of linesToSearchIn) {
      const { rawText: rawProducerText, cleanText: cleanProducerText } = ExtractionToolsService.getLastTextBlockOfLine(line);
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
}
