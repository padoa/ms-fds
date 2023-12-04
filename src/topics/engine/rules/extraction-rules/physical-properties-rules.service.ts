import _ from 'lodash';

import type { IExtractedPhysicalState, IFDSTree, ILine } from '@topics/engine/model/fds.model.js';
import { ExtractionCleanerService } from '@topics/engine/rules/extraction-cleaner.service.js';

export class PhysicalPropertiesRulesService {
  //----------------------------------------------------------------------------------------------
  //------------------------------------- PHYSICAL STATE -----------------------------------------
  //----------------------------------------------------------------------------------------------

  public static getPhysicalState(fdsTree: IFDSTree): IExtractedPhysicalState {
    const linesToSearchIn = fdsTree[9]?.subsections?.[1]?.lines;

    if (_.isEmpty(linesToSearchIn)) return null;

    return (
      PhysicalPropertiesRulesService.getPhysicalStateByText(linesToSearchIn) ||
      PhysicalPropertiesRulesService.getPhysicalStateByValue(linesToSearchIn)
    );
  }

  public static PHYSICAL_STATE_IDENTIFIER_REGEX = /[eé]tatphysique|aspect/g;

  public static getPhysicalStateByText(linesToSearchIn: ILine[]): IExtractedPhysicalState {
    for (const line of linesToSearchIn) {
      const lineText = line.texts.map(({ content }) => content).join(' ');
      const physicalStateTextInLine = !!lineText?.replaceAll(' ', '').match(PhysicalPropertiesRulesService.PHYSICAL_STATE_IDENTIFIER_REGEX);

      const { content } = _.last(line.texts) || { content: '' };
      const expectedText = _(content).split(':').last().trim();
      const expectedTextIsNotAPhysicalStateIdentifier = !expectedText
        ?.replaceAll(' ', '')
        .match(PhysicalPropertiesRulesService.PHYSICAL_STATE_IDENTIFIER_REGEX);

      if (expectedText && physicalStateTextInLine && expectedTextIsNotAPhysicalStateIdentifier) {
        const { pageNumber, startBox, endBox } = line;
        const metaData = { pageNumber, startBox, endBox };
        return { value: ExtractionCleanerService.trimAndCleanTrailingDot(expectedText), metaData };
      }
    }
    return null;
  }

  public static PHYSICAL_STATE_VALUES_REGEX = /liquide|gaz|poudre|granul[eé]|a[eé]rosol|solide|grain|pastille|copeaux|p[aâ]te|fluide/g;

  public static getPhysicalStateByValue(linesToSearchIn: ILine[]): IExtractedPhysicalState {
    for (const line of linesToSearchIn) {
      const { content } = _.last(line.texts) || { content: '' };
      const expectedText = _(content).split(':').last().trim();
      const expectedTextIsAPhysicalState = expectedText.match(PhysicalPropertiesRulesService.PHYSICAL_STATE_VALUES_REGEX);

      if (expectedTextIsAPhysicalState) {
        const { pageNumber, startBox, endBox } = line;
        const metaData = { pageNumber, startBox, endBox };
        return { value: ExtractionCleanerService.trimAndCleanTrailingDot(expectedText), metaData };
      }
    }
    return null;
  }
}
