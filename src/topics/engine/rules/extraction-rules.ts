import { format } from 'date-fns';
import _ from 'lodash';

import type {
  IExtractedData,
  IFDSTree,
  IExtractedSubstance,
  IExtractedDanger,
  IExtractedDate,
  IExtractedProduct,
  IExtractedProducer,
} from '@topics/engine/model/fds.model.js';
import { MONTH_MAPPING } from '@topics/engine/rules/rules.constants.js';
import { ExtractionCleanerService } from '@topics/engine/rules/extraction-cleaner.service.js';
import { PhysicalPropertiesRulesService } from '@topics/engine/rules/extraction-rules/physical-properties-rules.service.js';

export const applyExtractionRules = async ({ fdsTreeCleaned, fullText }: { fdsTreeCleaned: IFDSTree; fullText: string }): Promise<IExtractedData> => {
  return {
    date: getDate(fullText),
    product: getProduct(fdsTreeCleaned, { fullText }),
    producer: getProducer(fdsTreeCleaned),
    hazards: getHazards(fdsTreeCleaned),
    substances: getSubstances(fdsTreeCleaned),
    physicalState: PhysicalPropertiesRulesService.getPhysicalState(fdsTreeCleaned),
  };
};

//----------------------------------------------------------------------------------------------
//----------------------------------------- DATE -----------------------------------------------
//----------------------------------------------------------------------------------------------

const noSingleDigitStartRegex = '(?<!\\d{1})';
const dayRegex = '[1-9]|[12][0-9]|3[01]';
const numberDayRegex = `0${dayRegex}`;
const monthRegex = '(0[1-9]|1[0-2])';
const yearRegex = '(19\\d{2}|20\\d{2}|\\d{2})';
const dateSeparatorsRegex = '(\\/|-|\\.)';

export const numberDateRegex = `(${noSingleDigitStartRegex}(${numberDayRegex})${dateSeparatorsRegex}${monthRegex}${dateSeparatorsRegex}${yearRegex}(?!:\\d{2}))`;
export const stringDateRegex = `(${noSingleDigitStartRegex}(${dayRegex})-?([a-zA-Z]+)\\.?.?(19\\d{2}|20\\d{2}))`;
export const englishNumberDateRegex = `(${yearRegex}${dateSeparatorsRegex}${monthRegex}${dateSeparatorsRegex}(${numberDayRegex}))`;

export const dateRegexps = [numberDateRegex, stringDateRegex, englishNumberDateRegex];

export const getDate = (fullText: string): IExtractedDate => {
  const text = fullText.replaceAll(' ', '').replaceAll('û', 'u');
  const inTextDate = getDateByRevisionText(text) || getDateByMostFrequent(text) || getDateByMostRecent(text);
  if (!inTextDate) return { formattedDate: null, inTextDate: null };
  const parsedDate = parseDate(inTextDate);

  return {
    formattedDate: parsedDate && !Number.isNaN(parsedDate.getTime()) ? format(parsedDate, 'yyyy/MM/dd') : null,
    inTextDate,
  };
};

export const getDateByRevisionText = (fullText: string): string | null => {
  const revisionDateRegex = 'révision.?';

  for (const dateRegex of dateRegexps) {
    const revisionDateMatch = fullText.match(new RegExp(revisionDateRegex + dateRegex));
    if (revisionDateMatch?.length) return revisionDateMatch[1];
  }
  return null;
};

export const getDateByMostFrequent = (fullText: string): string | undefined | null => {
  const numberDates = fullText.match(new RegExp(numberDateRegex, 'g')) || [];
  const stringDates = fullText.match(new RegExp(stringDateRegex, 'g')) || [];
  const dates = [...numberDates, ...stringDates];
  const dateCounts = _.reduce(
    dates,
    (counts, date) => {
      const count = counts?.[date]?.count || 0;
      return {
        ...counts,
        [date]: {
          date,
          count: count + 1,
        },
      };
    },
    {} as { [date: string]: { date: string; count: number } },
  );
  const maxCount = _.max(Object.values(dateCounts).map(({ count }) => count));
  if (maxCount < 3) return null;
  const mostUsedDates = _.filter(dates, (date) => dateCounts[date].count === maxCount);
  return _.maxBy(mostUsedDates, parseDate);
};

export const getDateByMostRecent = (fullText: string): string | undefined => {
  const numberDates = fullText.match(new RegExp(numberDateRegex, 'g')) || [];
  const stringDates = fullText.match(new RegExp(stringDateRegex, 'g')) || [];
  const dates = [...numberDates, ...stringDates];
  return _.maxBy(dates, parseDate);
};

export const parseDate = (date: string): Date | null => {
  return parseDateFromNumberRegex(date) || parseDateFromStringRegex(date) || parseDateFromEnglishNumberRegex(date);
};

// TODO: refacto these blocs to avoid code duplication
const parseDateFromNumberRegex = (date: string): Date | null => {
  const regexMatches = date.match(new RegExp(numberDateRegex)); // TODO: refacto to not always recreate Regexp
  if (!regexMatches) return null;
  // eslint-disable-next-line prefer-const
  let [, , day, , month, , year] = regexMatches;
  if (year.length === 2) year = `${+year > 50 ? '19' : '20'}${year}`;
  return new Date(`${year}/${month}/${day}`);
};

const parseDateFromStringRegex = (date: string): Date | null => {
  const regexMatches = date.match(new RegExp(stringDateRegex));
  if (!regexMatches) return null;
  const [, , day, month, year] = regexMatches;
  return new Date(`${year} ${MONTH_MAPPING[month] || month} ${day}`);
};

const parseDateFromEnglishNumberRegex = (date: string): Date | null => {
  const regexMatches = date.match(new RegExp(englishNumberDateRegex));
  if (!regexMatches) return null;
  const [, , year, , month, , day] = regexMatches;
  return new Date(`${year} ${month} ${day}`);
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
    const lineText = line.texts.map(({ content }) => content).join(' ');
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
    const lineText = line.texts.map(({ content }) => content).join('');
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
    )
      continue;

    const { pageNumber, startBox, endBox } = line;

    return { name: ExtractionCleanerService.trimAndCleanTrailingDot(text), metaData: { pageNumber, startBox, endBox } };
  }
  return null;
};

//----------------------------------------------------------------------------------------------
//---------------------------------------- HAZARDS ---------------------------------------------
//----------------------------------------------------------------------------------------------

export const getHazards = (fdsTree: IFDSTree): IExtractedDanger[] => {
  const linesToSearchIn = fdsTree[2]?.subsections?.[2]?.lines;
  const textInEachLine = _.map(linesToSearchIn, ({ texts }) => {
    return _.map(texts, 'content').join('');
  });

  // TODO: possible improvement: concat all lines then use regex once to extract hazards
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
