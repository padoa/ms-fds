import { promiseMapSeries } from '@padoa/promise';
import _ from 'lodash';

import { buildFDSTree, cleanFDSTree } from '@src/tasks/poc/pdf_extracter/build_tree.js';
import type { IFDSTree } from '@src/tasks/poc/pdf_extracter/build_tree.js';
import { getFilesInDirectory } from '@src/tasks/poc/pdf_parser.js';

const FDS_FOLDER = `/Users/padoa/meta-haw/packages/ms-fds/resources/pdf/apst18`;

// const FILENAME = '325_fds_2019_rs-ultrasonic-cleaning-liquid.pdf';
// const FILENAME = '1533_fds_2017_jeffaclean h 100 sc.pdf';
// const FILENAME = '20058_fds_2014_sopracolle 300 n.pdf';
// const FILENAME = '003 05 FDS KLEEN 112 S.pdf';
// const FILENAME = '31354_fds_2018_renol-white-cw00301083.pdf';
// const FILENAME = 'B.6_fds-1.pdf';
// const FILENAME = 'FDS aubade BOSTIK.pdf';
// const FILENAME = 'Yann Pétillault-LC_283_G5_FDS.pdf';
// const FILENAME = 'fds emulcut 160 bw  fds.pdf';
// const FILENAME = 'fds neomat industrie.pdf';
// const FILENAME = 'FDS KORTEX H 120.pdf';
// const FILENAME = 'FDS Arma Perles-France.pdf';
// const FILENAME = 'FDS.20 WHITE GLOSS SPRAY RS COMPONENTS.pdf';
// const FILENAME = 'FDS Acétone Onyx.pdf';
// const FILENAME = 'FDS BACTEX.SID.pdf';
// const FILENAME = '31354_fds_2015_naugard xl-1 powder.pdf';
// const FILENAME = 'FDS CONDAT GLISS 150 SW.pdf';
// const FILENAME = 'FDS LOCTITE 648.pdf';
// const FILENAME = '20575_fds_2012_le-vrai-professionnel-od-om.pdf';
// const FILENAME = 'FDS_VaslubFG100_LubrifiantGAI.pdf';
// const FILENAME = '20058_fds_2015_alsan 770.pdf';
// const FILENAME = 'FDS Araldite 2011.pdf'; // Not valid FDS
// const FILENAME = 'FDS ROCOL RTD LIQUID.PDF'; // DOES NOT work because the text comes with so few chars (~3), it messes up the xCounts unable to correctly reassemble the pieces
// const FILENAME = 'FDS FR CENTREPOX N NF EVO DURCISSEUR - 2022 10 28.pdf'; // DOES NOT WORK, les h sont marqués uniquement dans la section classification

// IMAGES
// const FILENAME = '2549_fds_2017_argon.pdf';
// const FILENAME = '2549_fds_2016_revelateur-d-100.pdf'; // Fail to parse name because 1.1 is not readable
// const FILENAME = '3166_fds_2016_p3-topax 960.pdf'; // Fail to get date because only appears once
// const FILENAME = '31354_fds_2016_irganox 1330.pdf'; // Fail because tesseract adds a word that does not exist for some reason
// const FILENAME = '78834-fds-2017.pdf'; // Too big to be parsed
// const FILENAME = '2054_fds_2018_pelox-gel-decapant.pdf'; // Pas une FDS valide
const FILENAME = 'FDS  desinfectant surface Neoclean.pdf'; // Fail to fetch all hazards because p501 is read as pso1

export const extractDataFromAllFDS = async (): Promise<void> => {
  const files = await getFilesInDirectory(FDS_FOLDER);

  const dataExctracted = await promiseMapSeries(_.slice(files, 1), async (file) => {
    // console.log(file);
    const data = await extractDataFromFDS(file);
    // console.log(data);
    // console.log(`${file};${data?.date};${data?.productName};${data?.producer};${data?.hazards};${_.isNil(data)}`);
    return data;
  });
};

export const extractDataFromFDS = async (
  filename: string = FILENAME,
): Promise<{ date: string; productName: string; producer: string; hazards: string[] }> => {
  const { fdsTree, xCounts, fullText, fromImage } = await buildFDSTree(`${FDS_FOLDER}/${filename}`);

  if (!fullText) return null;

  const cleanedFDSTree = cleanFDSTree(fdsTree, { xCounts, fromImage });

  // console.log(JSON.stringify(cleanedFDSTree));
  // console.log(xCounts);
  // console.log('Date', getDate(pdf));
  // console.log('ProductName', getProductName(pdf));
  // console.log('Producer', getProducer(pdf));

  return {
    date: getDate(fullText),
    productName: getProductName(cleanedFDSTree, { fullText }),
    producer: getProducer(cleanedFDSTree),
    hazards: getHazards(cleanedFDSTree),
  };
};

const getDate = (fullText: string): string => {
  const numberDates = fullText.match(/(0[1-9]|[12][0-9]|3[01])(\/|-|\.)(0[1-9]|1[0-2])(\/|-|\.)(19\d{2}|20\d{2}|\d{2})/g) || [];
  const stringDates = fullText.match(/(0[1-9]|[12][0-9]|3[01])( )?[a-zA-Z]*( )?(20\d{2})/g) || [];
  const dateCounts = _.reduce(
    [...numberDates, ...stringDates],
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
  const mostUseDate = _.maxBy(Object.values(dateCounts), 'count');
  return mostUseDate?.count >= 3 ? mostUseDate.date : null;
};

const getProductName = (fdsTree: IFDSTree, { fullText }: { fullText: string }): string => {
  const linesToSearchIn = fdsTree[1]?.subsections?.[1]?.lines;

  console.log(JSON.stringify(linesToSearchIn));
  // console.log(JSON.stringify(fdsTree));
  // console.log(fullText);

  if (_.isEmpty(linesToSearchIn)) return null;

  for (const line of linesToSearchIn) {
    const { content } = _.last(line.texts) || { content: '' };
    const text = _(content).split(':').last().trim();
    if (
      !text ||
      _.includes(text, '1.1') ||
      _.includes(text, 'nom du produit') ||
      _.includes(text, 'mélange') ||
      _.includes(text, 'identificateur de produit')
    )
      continue;
    const numberOfOtherMatchesInDocument = fullText
      .replaceAll(' ', '')
      .match(new RegExp(`${text.replaceAll(' ', '').replaceAll('/', '\\/').replaceAll('(', '\\(').replaceAll(')', '\\)')}`, 'g'));
    if (numberOfOtherMatchesInDocument?.length >= 3) return text;
  }
  return null;
};

const getProducer = (fdsTree: IFDSTree): string => {
  const linesToSearchIn = fdsTree[1]?.subsections?.[3]?.lines;

  // console.log(JSON.stringify(fdsTree));
  console.log(JSON.stringify(linesToSearchIn));

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

const getHazards = (fdsTree: IFDSTree): string[] => {
  const linesToSearchIn = fdsTree[2]?.subsections?.[2]?.lines;
  const textInEachLine = _.map(linesToSearchIn, ({ texts }) => {
    return _.map(texts, 'content').join('');
  });

  console.log(textInEachLine);

  const matches = _(textInEachLine)
    .map((text) => {
      const customHazards = ['h350i', 'h360f', 'h360d', 'h360fd', 'h360df', 'h361f', 'h361d', 'h361fd'];
      const hazardsRegex = `(${customHazards.join(')|(')})|(h[2-4]\\d{2})`;
      const precautionRegex = '(p[1-5]\\d{2})';
      const europeanHazardsRegex = '(euh[02]\\d{2})|(euh401)';
      const textMatches = text.replaceAll(' ', '').match(new RegExp(`${europeanHazardsRegex}|${hazardsRegex}|${precautionRegex}`, 'g')) || [];
      return textMatches.join(' + ');
    })
    .flatMap()
    .compact()
    .value();

  console.log(JSON.stringify(linesToSearchIn));
  return matches;
};
