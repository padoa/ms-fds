import type { IExtractedData } from '@topics/extractor/model/fds.model.js';
import { buildFdsTree } from '@topics/extractor/transformer/fds_tree_builder.js';
import { cleanFDSTree } from '@topics/extractor/transformer/fds_tree_cleaner.js';
import { applyExtractionRules } from '@topics/extractor/rules/extractation_rules.js';
import { parsePDF } from '@topics/extractor/parser/pdf_parser.js';

const FDS_FOLDER = `/Users/padoa/meta-haw/packages/ms-fds/resources/pdf/apst18`;

// const FILENAME = '325_fds_2019_rs-ultrasonic-cleaning-liquid.pdf';
// const FILENAME = '1533_fds_2017_jeffaclean h 100 sc.pdf';
// const FILENAME = '20058_fds_2014_sopracolle 300 n.pdf';
// const FILENAME = '003 05 FDS KLEEN 112 S.pdf';
// const FILENAME = 'FDS B 90.pdf';
const FILENAME = '20058_fds_2015_coltack.pdf';
// const FILENAME = '31354_fds_2018_renol-white-cw00301083.pdf';
// const FILENAME = 'B.6_fds-1.pdf';
// const FILENAME = 'FDS aubade BOSTIK.pdf';
// const FILENAME = 'FDS.2 COLLE TEROSTAT MS939 TEROSON GRIS.pdf';
// const FILENAME = 'apolspray evo fds118 06.pdf';
// const FILENAME = 'fds cut max 903-22.pdf';
// const FILENAME = 'Yann Pétillault-LC_283_G5_FDS.pdf';
// const FILENAME = 'fds emulcut 160 bw  fds.pdf';
// const FILENAME = 'FT_FDS_GEL WC.pdf';
// const FILENAME = 'FT_FDS_CREME A RECURER.pdf';
// const FILENAME = 'fds neomat industrie.pdf';
// const FILENAME = 'fds into citrus.pdf';
// const FILENAME = 'FDS KORTEX H 120.pdf';
// const FILENAME = 'FDS Arma Perles-France.pdf';
// const FILENAME = 'FDS.20 WHITE GLOSS SPRAY RS COMPONENTS.pdf';
// const FILENAME = 'FDS Acétone Onyx.pdf';
// const FILENAME = 'FDS BACTEX.SID.pdf';
// const FILENAME = '20337-38293-06534-016410.pdf';
// const FILENAME = '20233-63243-05899-015124 (1).pdf';
// const FILENAME = 'innov-sols-desinfectant-floral_fds.pdf';
// const FILENAME = 'FDS ULTRASIL 125.PDF';
// const FILENAME = 'DEPANNAGE_INFO_ET_MAINTENANCE_FDS_gel_hydroalcoolique.pdf';
// const FILENAME = 'FDS CONDAT GLISS 150 SW.pdf';
// const FILENAME = 'FDS HYDROLUB HV 46.pdf';
// const FILENAME = 'FDS LOCTITE 648.pdf';
// const FILENAME = '20575_fds_2012_le-vrai-professionnel-od-om.pdf';
// const FILENAME = 'FDS_VaslubFG100_LubrifiantGAI.pdf';
// const FILENAME = '20058_fds_2015_alsan 770.pdf';
// const FILENAME = 'FDS ROCOL RTD LIQUID.PDF'; // DOES NOT work because the text comes with so few chars (~3), it messes up the xCounts unable to correctly reassemble the pieces
// const FILENAME = 'FDS FR CENTREPOX N NF EVO DURCISSEUR - 2022 10 28.pdf'; // DOES NOT WORK, les h sont marqués uniquement dans la section classification
// const FILENAME = '73981_fds_2014_spray-desinfectant-agroalimentaire-techline.pdf';
// const FILENAME = 'FDS FUCHS RENOLIN EXTRA 100 S_FR_FR_1_1.PDF';
// const FILENAME = '22700_fds_2015_chaux.pdf';
// const FILENAME = 'FDS ROSLER AR8407.pdf';

// IMAGES
// const FILENAME = '2549_fds_2017_argon.pdf';
// const FILENAME = '3166_fds_2016_p3-topax 960.pdf';
// const FILENAME = '2549_fds_2016_revelateur-d-100.pdf'; // Fail to parse name because 1.1 is not readable
// const FILENAME = '32582_fds_16_deltapro-colle-pvc.pdf'; // Fail to get date because only appears once
// const FILENAME = '31354_fds_2016_irganox 1330.pdf'; // Fail because tesseract adds a word that does not exist for some reason
// const FILENAME = '78834-fds-2017.pdf';
// const FILENAME = '2054_fds_2018_pelox-gel-decapant.pdf'; // Pas une FDS valide
// const FILENAME = 'FDS  desinfectant surface Neoclean.pdf'; // Fail to fetch all hazards because p501 is read as pso1
// const FILENAME = '2549_fds_2013_brill-bomar.pdf';
// const FILENAME = 'covalsens-test salinite -10 c-fds.pdf';
// const FILENAME = 'sintofer mastic standard -FDS.pdf';

export const extractDataFromFDS = async (
  fdsFilePath: string = `${FDS_FOLDER}/${FILENAME}`,
): Promise<{
  dataExtracted: IExtractedData;
  fromImage: boolean;
}> => {
  const { lines, fromImage } = await parsePDF(fdsFilePath);
  const { fdsTree, xCounts, fullText } = buildFdsTree(lines);
  const fdsTreeCleaned = cleanFDSTree(fdsTree, { xCounts, fromImage });
  const dataExtracted = await applyExtractionRules({ fdsTreeCleaned, fullText });
  return { dataExtracted, fromImage };
};
