export const REGEX_TO_MATCH_SECTION = {
  1: /(rubrique1(?!.?[0-9])|identificationdum[eé]lange|identificationdelasubstance|identificationduproduit)/g,
  2: /identificationdesdangers/g,
  3: /informationssurlescomposants/g,
} as { [key: number]: RegExp };

export const SUB_SECTIONS_TO_CONSIDER = {
  1: {
    1: /(1(\.|,)1)|(identificateurd[eu]produit)/g,
    3: /(1(\.|,)3)|(renseignementsconcernantlefournisseur)/g,
  },
  2: {
    2: /(2(\.|,)2)|(élementsd'étiquetage)/g,
  },
  3: {
    1: /(3(\.|,)1)/g,
    2: /(3(\.|,)2)/g,
  },
} as { [section: number]: { [subsection: string]: RegExp } };

export const MONTH_MAPPING = {
  aout: 'august',
} as { [key: string]: string };
