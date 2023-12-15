import _ from 'lodash';
import type { IExtractedProduct } from '@padoa/chemical-risk';

import type { IFdsTree, ILine } from '@topics/engine/model/fds.model.js';
import { TextCleanerService } from '@topics/engine/text-cleaner.service.js';

export class ProductRulesService {
  public static getProduct(fdsTree: IFdsTree, { fullText }: { fullText: string }): IExtractedProduct | null {
    return this.getProductByText(fdsTree) || this.getProductByLineOrder(fdsTree, { fullText });
  }

  private static PRODUCT_IDENTIFIER = 'nomduproduit';

  public static getProductByText(fdsTree: IFdsTree): IExtractedProduct | null {
    const linesToSearchIn = fdsTree[1]?.subsections?.[1]?.lines;

    if (_.isEmpty(linesToSearchIn)) return null;

    let nameInCurrentLine = false;
    for (const line of linesToSearchIn) {
      const metaData = { startBox: line.startBox, endBox: line.endBox };

      const lineCleanText = _.map(line.texts, ({ cleanContent }) => cleanContent).join('');
      const { cleanProductText, rawProductText } = this.extractRawAndCleanProductText(line);

      if (nameInCurrentLine) return { name: rawProductText, metaData };

      if (_.includes(lineCleanText.replaceAll(' ', ''), this.PRODUCT_IDENTIFIER)) {
        if (_.includes(cleanProductText.replaceAll(' ', ''), this.PRODUCT_IDENTIFIER)) {
          nameInCurrentLine = true;
          continue;
        }
        return { name: rawProductText, metaData };
      }
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

  public static getProductByLineOrder(fdsTree: IFdsTree, { fullText }: { fullText: string }): IExtractedProduct | null {
    const linesToSearchIn = fdsTree[1]?.subsections?.[1]?.lines;

    if (_.isEmpty(linesToSearchIn)) return null;

    for (const line of linesToSearchIn) {
      const lineCleanText = _.map(line.texts, ({ cleanContent }) => cleanContent).join('');
      const { rawProductText, cleanProductText } = this.extractRawAndCleanProductText(line);

      if (
        !cleanProductText ||
        _.includes(cleanProductText, '1.1') ||
        _.includes(cleanProductText, 'nom du produit') ||
        _.includes(cleanProductText, 'mélange') ||
        _.includes(cleanProductText, 'identificateur de produit') ||
        _.includes(lineCleanText, 'forme du produit')
      ) {
        continue;
      }

      const cleanedFullText = TextCleanerService.cleanSpaces(TextCleanerService.cleanRawText(fullText));
      const numberOfOtherMatchesInDocument = cleanedFullText.match(
        new RegExp(`${cleanProductText.replaceAll(' ', '').replaceAll('/', '\\/').replaceAll('(', '\\(').replaceAll(')', '\\)')}`, 'g'),
      );
      if (numberOfOtherMatchesInDocument?.length >= 3) return { name: rawProductText, metaData: { startBox: line.startBox, endBox: line.endBox } };
    }
    return null;
  }
}
