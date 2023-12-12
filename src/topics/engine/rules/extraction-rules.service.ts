import type { IExtractedData, IFdsTree } from '@topics/engine/model/fds.model.js';
import { PhysicalStateRulesService } from '@topics/engine/rules/extraction-rules/physical-state-rules.service.js';
import { RevisionDateRulesService } from '@topics/engine/rules/extraction-rules/revision-date-rules.service.js';
import { ProductRulesService } from '@topics/engine/rules/extraction-rules/product-rules.service.js';
import { ProducerRulesService } from '@topics/engine/rules/extraction-rules/producer-rules.service.js';
import { DangersRulesService } from '@topics/engine/rules/extraction-rules/dangers-rules.service.js';
import { SubstancesRulesService } from '@topics/engine/rules/extraction-rules/substances-rules.service.js';
import { VaporPressureService } from '@topics/engine/rules/extraction-rules/vapor-pressure.service.js';
import { BoilingPointRulesService } from '@topics/engine/rules/extraction-rules/boiling-point-rules.service.js';

export class ExtractionRulesService {
  public static async extract({ fdsTreeCleaned, fullText }: { fdsTreeCleaned: IFdsTree; fullText: string }): Promise<IExtractedData> {
    return {
      date: RevisionDateRulesService.getDate(fullText),
      product: ProductRulesService.getProduct(fdsTreeCleaned, { fullText }),
      producer: ProducerRulesService.getProducer(fdsTreeCleaned),
      dangers: DangersRulesService.getDangers(fdsTreeCleaned),
      substances: SubstancesRulesService.getSubstances(fdsTreeCleaned),
      physicalState: PhysicalStateRulesService.getPhysicalState(fdsTreeCleaned),
      vaporPressure: VaporPressureService.getVaporPressure(fdsTreeCleaned),
      boilingPoint: BoilingPointRulesService.getBoilingPoint(fdsTreeCleaned),
    };
  }
}
