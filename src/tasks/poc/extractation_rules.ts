import { format } from 'date-fns';
import _ from 'lodash';

import type { IFDSTree, ISubstance } from '@src/tasks/poc/fds.model.js';

export const applyExtractionRules = async ({
  fdsTreeCleaned,
  fullText,
}: {
  fdsTreeCleaned: IFDSTree;
  fullText: string;
}): Promise<{ date: string; inTextDate: string; productName: string; producer: string; hazards: string[]; substances: ISubstance[] }> => {
  return {
    ...getDate(fullText),
    productName: getProductName(fdsTreeCleaned, { fullText }),
    producer: getProducer(fdsTreeCleaned),
    hazards: getHazards(fdsTreeCleaned),
    substances: getSubstances(fdsTreeCleaned),
  };
};

//----------------------------------------------------------------------------------------------
//----------------------------------------- DATE -----------------------------------------------
//----------------------------------------------------------------------------------------------

const numberDateRegex = '((?<!\\d{1})(0[1-9]|[12][0-9]|3[01])(\\/|-|\\.)(0[1-9]|1[0-2])(\\/|-|\\.)(19\\d{2}|20\\d{2}|\\d{2})(?!:\\d{2}))';
const stringDateRegex = '((?<!\\d{1})([1-9]|[12][0-9]|3[01])-?([a-zA-Z]+)\\.?.?(20\\d{2}))';
const englishNumberDateRegex = '((19\\d{2}|20\\d{2}|\\d{2})(\\/|-|\\.)(0[1-9]|1[0-2])(\\/|-|\\.)(0[1-9]|[12][0-9]|3[01]))';
const dateRegexps = [numberDateRegex, stringDateRegex, englishNumberDateRegex];

const getDate = (fullText: string): { date: string; inTextDate: string } => {
  const text = fullText.replaceAll(' ', '').replaceAll('û', 'u');
  const inTextDate = getDateByText(text) || getDateByMostFrequent(text) || getDateByMostRecent(text);
  return {
    date: inTextDate ? format(parseDate(inTextDate), 'yyyy/MM/dd') : null,
    inTextDate,
  };
};

const getDateByText = (fullText: string): string => {
  const revisionDateRegex = 'révision.?';

  for (const dateRegex of dateRegexps) {
    const revisionDateMatch = fullText.match(new RegExp(revisionDateRegex + dateRegex));
    if (revisionDateMatch?.length) return revisionDateMatch[1];
  }

  return null;
};

const getDateByMostFrequent = (fullText: string): string => {
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

const getDateByMostRecent = (fullText: string): string => {
  const numberDates = fullText.match(new RegExp(numberDateRegex, 'g')) || [];
  const stringDates = fullText.match(new RegExp(stringDateRegex, 'g')) || [];
  const dates = [...numberDates, ...stringDates];
  return _.maxBy(dates, parseDate);
};

const parseDate = (date: string): Date => {
  return parseDateFromNumberRegex(date) || parseDateFromStringRegex(date) || parseDateFromEnglishNumberRegex(date);
};

const parseDateFromNumberRegex = (date: string): Date => {
  const regexMatches = date.match(new RegExp(numberDateRegex));
  if (!regexMatches) return null;
  // eslint-disable-next-line prefer-const
  let [, , day, , month, , year] = regexMatches;
  if (year.length === 2) year = `${+year > 50 ? '19' : '20'}${year}`;
  return new Date(`${year}/${month}/${day}`);
};

const MONTH_MAPPING = {
  aout: 'august',
} as { [key: string]: string };

const parseDateFromStringRegex = (date: string): Date => {
  const regexMatches = date.match(new RegExp(stringDateRegex));
  if (!regexMatches) return null;
  const [, , day, month, year] = regexMatches;
  return new Date(`${year} ${MONTH_MAPPING[month] || month} ${day}`);
};

const parseDateFromEnglishNumberRegex = (date: string): Date => {
  const regexMatches = date.match(new RegExp(englishNumberDateRegex));
  if (!regexMatches) return null;
  const [, , year, , month, , day] = regexMatches;
  return new Date(`${year} ${month} ${day}`);
};

//----------------------------------------------------------------------------------------------
//------------------------------------- PRODUCT NAME -------------------------------------------
//----------------------------------------------------------------------------------------------

const getProductName = (fdsTree: IFDSTree, { fullText }: { fullText: string }): string => {
  return getProductNameByText(fdsTree) || getProductNameByLineOrder(fdsTree, { fullText });
};

const getProductNameByText = (fdsTree: IFDSTree): string => {
  const linesToSearchIn = fdsTree[1]?.subsections?.[1]?.lines;

  // console.log(JSON.stringify(linesToSearchIn));

  if (_.isEmpty(linesToSearchIn)) return null;

  let nameInCurrentLine = false;
  for (const line of linesToSearchIn) {
    const lineText = line.texts.map(({ content }) => content).join(' ');
    const { content } = _.last(line.texts) || { content: '' };
    const text = _(content).split(':').last().trim();
    if (nameInCurrentLine) return text;

    if (_.includes(lineText.replaceAll(' ', ''), 'nomduproduit')) {
      if (_.includes(text.replaceAll(' ', ''), 'nomduproduit')) {
        nameInCurrentLine = true;
        continue;
      }
      return text;
    }
  }
  return null;
};

const getProductNameByLineOrder = (fdsTree: IFDSTree, { fullText }: { fullText: string }): string => {
  const linesToSearchIn = fdsTree[1]?.subsections?.[1]?.lines;

  if (_.isEmpty(linesToSearchIn)) return null;

  for (const line of linesToSearchIn) {
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
    )
      continue;
    const numberOfOtherMatchesInDocument = fullText
      .replaceAll(' ', '')
      .match(new RegExp(`${text.replaceAll(' ', '').replaceAll('/', '\\/').replaceAll('(', '\\(').replaceAll(')', '\\)')}`, 'g'));
    if (numberOfOtherMatchesInDocument?.length >= 3) return text;
  }
  return null;
};

//----------------------------------------------------------------------------------------------
//--------------------------------------- PRODUCER ---------------------------------------------
//----------------------------------------------------------------------------------------------

const getProducer = (fdsTree: IFDSTree): string => {
  const linesToSearchIn = fdsTree[1]?.subsections?.[3]?.lines;

  // console.log(JSON.stringify(fdsTree));
  // console.log(JSON.stringify(linesToSearchIn));

  if (_.isEmpty(linesToSearchIn)) return null;

  for (const line of linesToSearchIn) {
    const { content } = _.last(line.texts);
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

    return text;
  }
  return null;
};

//----------------------------------------------------------------------------------------------
//---------------------------------------- HAZARDS ---------------------------------------------
//----------------------------------------------------------------------------------------------

const getHazards = (fdsTree: IFDSTree): string[] => {
  const linesToSearchIn = fdsTree[2]?.subsections?.[2]?.lines;
  const textInEachLine = _.map(linesToSearchIn, ({ texts }) => {
    return _.map(texts, 'content').join('');
  });

  // console.log(textInEachLine);

  const matches = _(textInEachLine)
    .map((text) => {
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

  // console.log(JSON.stringify(linesToSearchIn));
  return matches;
};

//----------------------------------------------------------------------------------------------
//--------------------------------------- SUBSTANCES -------------------------------------------
//----------------------------------------------------------------------------------------------

const getSubstances = (fdsTree: IFDSTree): ISubstance[] => {
  const linesToSearchIn = [...(fdsTree[3]?.subsections?.[1]?.lines || []), ...(fdsTree[3]?.subsections?.[2]?.lines || [])];
  const textInEachLine = _.map(linesToSearchIn, ({ texts }) => {
    return _.map(texts, 'content').join('');
  });

  const substances: ISubstance[] = [];
  let previousLineSubstance: Partial<ISubstance> = {};
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

const getCASNumber = (text: string): string => {
  // TODO rule with cas
  const match = text.match(/(?<!(-|\d{1})+)(\d{1,7}-\d{2}-\d{1})(?!(–|\d{1})+)/);
  return match?.[2];
};

const getCENumber = (text: string): string => {
  // TODO rule with ce
  const match = text.match(/(?<!(\d{1})+)(\d{3}-\d{3}-\d{1})(?!(\d{1})+)/);
  return match?.[2];
};
