export const SECTIONS_REGEX = {
  1: /(rubrique1(?!.?[0-9])|identificationdum[eé]lange|identificationdelasubstance|identificationduproduit)/g,
  2: /identificationdesdangers/g,
  3: /informations?surles(composants|ingr[eé]dients)/g,
  4: /premierssecours/g,
  5: /mesuresdeluttecontrel.incendie|mesuresanti.?incendie/g,
  6: /mesures[aà]prendreencasde(dispersion|d[eé]versement|rejet)/g,
  7: /manipulationetstockage/g,
  8: /contr[oô]les?del.exposition|protectionindividuelle/g,
  9: /propri[eé]t[eé]sphysiquesetchimiques/g,
  10: /stabilit[eé]etr[eé]activit[eé]/g,
  // Continue if needeed => 1 more than the last expected one
} as { [key: number]: RegExp };

export const SUB_SECTIONS_REGEX = {
  1: [
    {
      subSectionNumber: 1,
      subSectionRegex: /(1(\.|,)1)|(identificateurd[eu]produit)/g,
    },
    {
      subSectionNumber: 3,
      subSectionRegex: /(1(\.|,)3)|(renseignementsconcernantlefournisseur)/g,
    },
  ],
  2: [
    {
      subSectionNumber: 2,
      subSectionRegex: /(2(\.|,)2)|([eé]l[eé]mentsd.[eé]tiquetage)/g,
    },
  ],
  3: [
    {
      subSectionNumber: 1,
      subSectionRegex: /(3(\.|,)1)/g,
    },
    {
      subSectionNumber: 2,
      subSectionRegex: /(3(\.|,)2)/g,
    },
  ],
  9: [
    {
      subSectionNumber: 1,
      subSectionRegex: /(9(\.|,)1)|informationssurlespropri[eé]t[eé]sphysiquesetchimiques/g,
    },
  ],
} as { [section: number]: { subSectionNumber: number; subSectionRegex: RegExp }[] };

export const MONTH_MAPPING = {
  août: 'august',
  février: 'february',
  décembre: 'december',
} as { [key: string]: string };
