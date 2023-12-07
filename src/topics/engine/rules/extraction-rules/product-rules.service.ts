import _ from 'lodash';

import type { IFdsTree, IExtractedProduct } from '@topics/engine/model/fds.model.js';

export class ProductRulesService {
  public static getProduct(fdsTree: IFdsTree, { fullText }: { fullText: string }): IExtractedProduct | null {
    return this.getProductByText(fdsTree) || this.getProductByLineOrder(fdsTree, { fullText });
  }

  public static getProductByText(fdsTree: IFdsTree): IExtractedProduct | null {
    const linesToSearchIn = fdsTree[1]?.subsections?.[1]?.lines;

    if (_.isEmpty(linesToSearchIn)) return null;

    let nameInCurrentLine = false;
    for (const line of linesToSearchIn) {
      const { startBox, endBox } = line;
      const metaData = { startBox, endBox };
      const lineText = _.map(line.texts, ({ content }) => content).join(' ');
      const { content } = _.last(line.texts) || { content: '' };
      const text = _(content).split(':').last().trim();
      if (nameInCurrentLine) return { name: text, metaData };

      if (_.includes(lineText.replaceAll(' ', ''), 'nomduproduit')) {
        if (_.includes(text.replaceAll(' ', ''), 'nomduproduit')) {
          nameInCurrentLine = true;
          continue;
        }
        return { name: text, metaData };
      }
    }
    return null;
  }

  public static getProductByLineOrder(fdsTree: IFdsTree, { fullText }: { fullText: string }): IExtractedProduct | null {
    const linesToSearchIn = fdsTree[1]?.subsections?.[1]?.lines;

    if (_.isEmpty(linesToSearchIn)) return null;

    for (const line of linesToSearchIn) {
      const { startBox, endBox } = line;
      const lineText = _.map(line.texts, ({ content }) => content).join('');
      const { content } = _.last(line.texts) || { content: '' };
      const text = _(content).split(':').last().trim();
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
