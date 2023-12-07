import _ from 'lodash';

import type {
  IExtractedData,
  IFDSTree,
  IExtractedSubstance,
  IExtractedDanger,
  IExtractedProduct,
  IExtractedProducer,
} from '@topics/engine/model/fds.model.js';
import { ExtractionCleanerService } from '@topics/engine/rules/extraction-cleaner.service.js';
import { PhysicalPropertiesRulesService } from '@topics/engine/rules/extraction-rules/physical-properties-rules.service.js';
import { RevisionDateRulesService } from '@topics/engine/rules/extraction-rules/revision-date-rules.service.js';

export const applyExtractionRules = async ({ fdsTreeCleaned, fullText }: { fdsTreeCleaned: IFDSTree; fullText: string }): Promise<IExtractedData> => {
  return {
    date: RevisionDateRulesService.getDate(fullText),
    product: getProduct(fdsTreeCleaned, { fullText }),
    producer: getProducer(fdsTreeCleaned),
    dangers: getDangers(fdsTreeCleaned),
    substances: getSubstances(fdsTreeCleaned),
    physicalState: PhysicalPropertiesRulesService.getPhysicalState(fdsTreeCleaned),
  };
};

//----------------------------------------------------------------------------------------------
//------------------------------------- PRODUCT NAME -------------------------------------------
//----------------------------------------------------------------------------------------------

export const getProduct = (fdsTree: IFDSTree, { fullText }: { fullText: string }): IExtractedProduct | null => {
  return getProductByText(fdsTree) || getProductByLineOrder(fdsTree, { fullText });
};

export const getProductByText = (fdsTree: IFDSTree): IExtractedProduct | null => {
  const linesToSearchIn = fdsTree[1]?.subsections?.[1]?.lines;

  if (_.isEmpty(linesToSearchIn)) return null;

  let nameInCurrentLine = false;
  for (const line of linesToSearchIn) {
    const { pageNumber, startBox, endBox } = line;
    const metaData = { pageNumber, startBox, endBox };
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
};

export const getProductByLineOrder = (fdsTree: IFDSTree, { fullText }: { fullText: string }): IExtractedProduct | null => {
  const linesToSearchIn = fdsTree[1]?.subsections?.[1]?.lines;

  if (_.isEmpty(linesToSearchIn)) return null;

  for (const line of linesToSearchIn) {
    const { pageNumber, startBox, endBox } = line;
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
    if (numberOfOtherMatchesInDocument?.length >= 3) return { name: text, metaData: { pageNumber, startBox, endBox } };
  }
  return null;
};

//----------------------------------------------------------------------------------------------
//--------------------------------------- PRODUCER ---------------------------------------------
//----------------------------------------------------------------------------------------------

export const getProducer = (fdsTree: IFDSTree): IExtractedProducer | null => {
  const linesToSearchIn = fdsTree[1]?.subsections?.[3]?.lines;

  if (_.isEmpty(linesToSearchIn)) return null;

  for (const line of linesToSearchIn) {
    const { content } = _.last(line.texts) || { content: '' };
    const text = _(content).split(':').last().trim();
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

    const { pageNumber, startBox, endBox } = line;

    return { name: ExtractionCleanerService.trimAndCleanTrailingDot(text), metaData: { pageNumber, startBox, endBox } };
  }
  return null;
};

//----------------------------------------------------------------------------------------------
//---------------------------------------- DANGERS ---------------------------------------------
//----------------------------------------------------------------------------------------------

export const getDangers = (fdsTree: IFDSTree): IExtractedDanger[] => {
  const linesToSearchIn = fdsTree[2]?.subsections?.[2]?.lines;
  const textInEachLine = _.map(linesToSearchIn, ({ texts }) => _.map(texts, 'content').join(''));

  // TODO: possible improvement: concat all lines then use regex once to extract dangers
  return _(textInEachLine)
    .map((text) => {
      // TODO: add unit tests on regexes
      const customHazards = ['h350i', 'h360f', 'h360d', 'h360fd', 'h360df', 'h361f', 'h361d', 'h361fd'];
      const hazardsRegex = `(${customHazards.join(')|(')})|(h[2-4]\\d{2})`;
      const precautionRegex = '(((p[1-5]\\d{2})\\+?)+)';
      const europeanHazardsRegex = '(euh[02]\\d{2})|(euh401)';
      const textMatches = text.replaceAll(' ', '').match(new RegExp(`${europeanHazardsRegex}|${hazardsRegex}|${precautionRegex}`, 'g')) || [];
      return textMatches.map((t) => t.replaceAll('+', ' + '));
    })
    .flatMap()
    .compact()
    .value();
};

//----------------------------------------------------------------------------------------------
//--------------------------------------- SUBSTANCES -------------------------------------------
//----------------------------------------------------------------------------------------------

export const getSubstances = (fdsTree: IFDSTree): IExtractedSubstance[] => {
  const linesToSearchIn = [...(fdsTree[3]?.subsections?.[1]?.lines || []), ...(fdsTree[3]?.subsections?.[2]?.lines || [])];
  const textInEachLine = _.map(linesToSearchIn, ({ texts }) => {
    return _.map(texts, 'content').join('');
  });

  const substances: IExtractedSubstance[] = [];
  let previousLineSubstance: Partial<IExtractedSubstance> = {};
  for (const text of textInEachLine) {
    const textCleaned = text.replaceAll(' ', '');

    const casNumber = getCASNumber(textCleaned);
    const ceNumber = getCENumber(textCleaned);

    if (casNumber && ceNumber) {
      substances.push({ casNumber, ceNumber });
      previousLineSubstance = {};
      continue;
    }

    if (!casNumber && !ceNumber) {
      previousLineSubstance = {};
      continue;
    }

    const lastSubstance = _.last(substances);
    if (lastSubstance && lastSubstance.casNumber === previousLineSubstance.casNumber && lastSubstance.ceNumber === previousLineSubstance.ceNumber) {
      substances[substances.length - 1] = { casNumber: lastSubstance.casNumber || casNumber, ceNumber: lastSubstance.ceNumber || ceNumber };
      previousLineSubstance = {};
      continue;
    }

    previousLineSubstance = { casNumber, ceNumber };
    substances.push({ casNumber, ceNumber });
  }

  return substances;
};

export const CASNumberRegex = /(?<!(-|\d{1})+)(\d{1,7}-\d{2}-\d{1})(?!(-|\d{1})+)/;
export const CENumberRegex = /(?<!(\d{1})+)(\d{3}-\d{3}-\d{1})(?!(\d{1})+)/;

const getCASNumber = (text: string): string => {
  // TODO: rule with cas
  const match = text.match(CASNumberRegex);
  return match?.[2];
};

const getCENumber = (text: string): string => {
  // TODO: rule with ce
  const match = text.match(CENumberRegex);
  return match?.[2];
};
