import _ from 'lodash';

import type { IExtractedPhysicalState, IFdsTree, ILine } from '@topics/engine/model/fds.model.js';
import { ExtractionCleanerService } from '@topics/engine/rules/extraction-cleaner.service.js';

export class PhysicalStateRulesService {
  public static getPhysicalState(fdsTree: IFdsTree): IExtractedPhysicalState {
    const linesToSearchIn = fdsTree[9]?.subsections?.[1]?.lines;

    if (_.isEmpty(linesToSearchIn)) return null;

    return PhysicalStateRulesService.getPhysicalStateByText(linesToSearchIn) || PhysicalStateRulesService.getPhysicalStateByValue(linesToSearchIn);
  }

  public static readonly PHYSICAL_STATE_IDENTIFIER_REGEX = /[eé]tatphysique|aspect/g;

  public static getPhysicalStateByText(linesToSearchIn: ILine[]): IExtractedPhysicalState {
    for (const line of linesToSearchIn) {
      const lineText = line.texts.map(({ cleanContent }) => cleanContent).join(' ');
      const physicalStateTextInLine = !!lineText?.replaceAll(' ', '').match(PhysicalStateRulesService.PHYSICAL_STATE_IDENTIFIER_REGEX);

      const { cleanContent } = _.last(line.texts) || { cleanContent: '' };
      const expectedText = _(cleanContent).split(':').last().trim();
      const expectedTextIsNotAPhysicalStateIdentifier = !expectedText
        ?.replaceAll(' ', '')
        .match(PhysicalStateRulesService.PHYSICAL_STATE_IDENTIFIER_REGEX);

      if (expectedText && physicalStateTextInLine && expectedTextIsNotAPhysicalStateIdentifier) {
        const { startBox, endBox } = line;
        const metaData = { startBox, endBox };
        return { value: ExtractionCleanerService.trimAndCleanTrailingDot(expectedText), metaData };
      }
    }
    return null;
  }

  public static readonly PHYSICAL_STATE_VALUES_REGEX = /liquide|gaz|poudre|granul[eé]|a[eé]rosol|solide|grain|pastille|copeaux|p[aâ]te|fluide/g;

  public static getPhysicalStateByValue(linesToSearchIn: ILine[]): IExtractedPhysicalState {
    for (const line of linesToSearchIn) {
      const { cleanContent } = _.last(line.texts) || { cleanContent: '' };
      const expectedText = _(cleanContent).split(':').last().trim();
      const expectedTextIsAPhysicalState = expectedText.match(PhysicalStateRulesService.PHYSICAL_STATE_VALUES_REGEX);

      if (expectedTextIsAPhysicalState) {
        const { startBox, endBox } = line;
        const metaData = { startBox, endBox };
        return { value: ExtractionCleanerService.trimAndCleanTrailingDot(expectedText), metaData };
      }
    }
    return null;
  }
}
