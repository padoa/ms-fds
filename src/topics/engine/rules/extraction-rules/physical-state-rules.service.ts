import _ from 'lodash';
import type { IExtractedPhysicalState } from '@padoa/chemical-risk';

import type { IFdsTree, ILine } from '@topics/engine/model/fds.model.js';
import { TextCleanerService } from '@topics/engine/text-cleaner.service.js';

export class PhysicalStateRulesService {
  public static getPhysicalState(fdsTree: IFdsTree): IExtractedPhysicalState {
    const linesToSearchIn = fdsTree[9]?.subsections?.[1]?.lines;

    if (_.isEmpty(linesToSearchIn)) return null;

    return PhysicalStateRulesService.getPhysicalStateByText(linesToSearchIn) || PhysicalStateRulesService.getPhysicalStateByValue(linesToSearchIn);
  }

  public static readonly PHYSICAL_STATE_IDENTIFIER_REGEX = /[eé]tatphysique|aspect/g;

  public static getPhysicalStateByText(linesToSearchIn: ILine[]): IExtractedPhysicalState {
    for (const line of linesToSearchIn) {
      const lineCleanText = line.texts.map(({ cleanContent }) => cleanContent).join('');
      const { cleanPhysicalStateText, rawPhysicalStateText } = this.extractRawAndCleanPhysicalStateText(line);

      const physicalStateTextInLine = !!lineCleanText?.replaceAll(' ', '').match(PhysicalStateRulesService.PHYSICAL_STATE_IDENTIFIER_REGEX);
      const expectedTextIsNotAPhysicalStateIdentifier = !TextCleanerService.cleanSpaces(cleanPhysicalStateText)?.match(
        PhysicalStateRulesService.PHYSICAL_STATE_IDENTIFIER_REGEX,
      );

      if (cleanPhysicalStateText && physicalStateTextInLine && expectedTextIsNotAPhysicalStateIdentifier) {
        return {
          value: TextCleanerService.trimAndCleanTrailingDot(rawPhysicalStateText),
          metaData: { startBox: line.startBox, endBox: line.endBox },
        };
      }
    }
    return null;
  }

  public static readonly PHYSICAL_STATE_VALUES_REGEX = /liquide|gaz|poudre|granul[eé]|a[eé]rosol|solide|grain|pastille|copeaux|p[aâ]te|fluide/g;

  public static getPhysicalStateByValue(linesToSearchIn: ILine[]): IExtractedPhysicalState {
    for (const line of linesToSearchIn) {
      const { cleanPhysicalStateText, rawPhysicalStateText } = this.extractRawAndCleanPhysicalStateText(line);
      const expectedTextIsAPhysicalState = cleanPhysicalStateText.match(PhysicalStateRulesService.PHYSICAL_STATE_VALUES_REGEX);

      if (expectedTextIsAPhysicalState) {
        return {
          value: TextCleanerService.trimAndCleanTrailingDot(rawPhysicalStateText),
          metaData: { startBox: line.startBox, endBox: line.endBox },
        };
      }
    }
    return null;
  }

  private static extractRawAndCleanPhysicalStateText(line: ILine): { cleanPhysicalStateText: string; rawPhysicalStateText: string } {
    const { cleanContent, rawContent } = _.last(line.texts) || { cleanContent: '', rawContent: '' };
    return {
      cleanPhysicalStateText: this.extractPhysicalStateText(cleanContent),
      rawPhysicalStateText: this.extractPhysicalStateText(rawContent),
    };
  }

  private static extractPhysicalStateText(productText: string): string {
    return _(productText).split(':').last().trim();
  }
}
