import _ from 'lodash';

import type { IFdsTree, IExtractedProduct, ILine } from '@topics/engine/model/fds.model.js';

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

      const lineCleanText = _.map(line.texts, ({ cleanContent }) => cleanContent).join(' ');
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
      const { startBox, endBox } = line;
      const lineText = _.map(line.texts, ({ cleanContent }) => cleanContent).join('');
      const { cleanContent } = _.last(line.texts) || { cleanContent: '' };
      const text = _(cleanContent).split(':').last().trim();
      if (
        !text ||
        _.includes(text, '1.1') ||
        _.includes(text, 'nom du produit') ||
        _.includes(text, 'mélange') ||
        _.includes(text, 'identificateur de produit') ||
        _.includes(lineText, 'forme du produit')
      ) {
        continue;
      }
      const numberOfOtherMatchesInDocument = fullText
        .replaceAll(' ', '')
        .match(new RegExp(`${text.replaceAll(' ', '').replaceAll('/', '\\/').replaceAll('(', '\\(').replaceAll(')', '\\)')}`, 'g'));
      if (numberOfOtherMatchesInDocument?.length >= 3) return { name: text, metaData: { startBox, endBox } };
    }
    return null;
  }
}
