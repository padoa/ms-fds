import _ from 'lodash';
import type { IExtractedProduct } from '@padoa/chemical-risk';

import type { IFdsTree } from '@topics/engine/model/fds.model.js';
import { TextCleanerService } from '@topics/engine/text-cleaner.service.js';
import { ExtractionToolsService } from '@topics/engine/rules/extraction-rules/extraction-tools.service.js';

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
      const { cleanText: cleanProductText, rawText: rawProductText } = ExtractionToolsService.getTextValueByText(line);

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

  public static getProductByLineOrder(fdsTree: IFdsTree, { fullText }: { fullText: string }): IExtractedProduct | null {
    const linesToSearchIn = fdsTree[1]?.subsections?.[1]?.lines;

    if (_.isEmpty(linesToSearchIn)) return null;

    for (const line of linesToSearchIn) {
      const lineCleanText = _.map(line.texts, ({ cleanContent }) => cleanContent).join('');
      const { rawText: rawProductText, cleanText: cleanProductText } = ExtractionToolsService.getTextValueByText(line);

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
