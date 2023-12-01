import { describe, expect, it } from 'vitest';
import _ from 'lodash';

import { SUB_SECTIONS_REGEX } from '@topics/engine/rules/rules.constants.js';

describe('Sub section regex tests', () => {
  it.each<{ section: number; subSection: number; input: string; expected: boolean }>([
    {
      section: 1,
      subSection: 1,
      input: '1.1',
      expected: true,
    },
    {
      section: 1,
      subSection: 1,
      input: '1,1',
      expected: true,
    },
    {
      section: 1,
      subSection: 1,
      input: '1/1',
      expected: false,
    },
    {
      section: 1,
      subSection: 1,
      input: '1 1',
      expected: false,
    },
    {
      section: 1,
      subSection: 1,
      input: '11',
      expected: false,
    },
    {
      section: 1,
      subSection: 1,
      input: 'identificateurdeproduit',
      expected: true,
    },
    {
      section: 1,
      subSection: 1,
      input: 'identificateurduproduit',
      expected: true,
    },

    {
      section: 1,
      subSection: 1,
      input: 'identificateur',
      expected: false,
    },
    {
      section: 1,
      subSection: 1,
      input: 'produit',
      expected: false,
    },
    {
      section: 1,
      subSection: 3,
      input: '1.3',
      expected: true,
    },
    {
      section: 1,
      subSection: 3,
      input: '1,3',
      expected: true,
    },
    {
      section: 1,
      subSection: 3,
      input: '1/3',
      expected: false,
    },
    {
      section: 1,
      subSection: 3,
      input: '1 3',
      expected: false,
    },
    {
      section: 1,
      subSection: 3,
      input: '13',
      expected: false,
    },
    {
      section: 1,
      subSection: 3,
      input: 'renseignementsconcernantlefournisseur',
      expected: true,
    },
    {
      section: 1,
      subSection: 3,
      input: 'renseignements',
      expected: false,
    },
    {
      section: 1,
      subSection: 3,
      input: 'fournisseur',
      expected: false,
    },
    {
      section: 2,
      subSection: 2,
      input: '2.2',
      expected: true,
    },
    {
      section: 2,
      subSection: 2,
      input: '2,2',
      expected: true,
    },
    {
      section: 2,
      subSection: 2,
      input: '2/2',
      expected: false,
    },
    {
      section: 2,
      subSection: 2,
      input: '2 2',
      expected: false,
    },
    {
      section: 2,
      subSection: 2,
      input: '22',
      expected: false,
    },
    {
      section: 2,
      subSection: 2,
      input: "élémentsd'étiquetage",
      expected: true,
    },
    {
      section: 2,
      subSection: 2,
      input: "elémentsd'étiquetage",
      expected: true,
    },
    {
      section: 2,
      subSection: 2,
      input: "élementsd'étiquetage",
      expected: true,
    },
    {
      section: 2,
      subSection: 2,
      input: "elementsd'étiquetage",
      expected: true,
    },
    {
      section: 2,
      subSection: 2,
      input: "élémentsd'etiquetage",
      expected: true,
    },
    {
      section: 2,
      subSection: 2,
      input: "elémentsd'etiquetage",
      expected: true,
    },
    {
      section: 2,
      subSection: 2,
      input: "élementsd'etiquetage",
      expected: true,
    },
    {
      section: 2,
      subSection: 2,
      input: "elementsd'etiquetage",
      expected: true,
    },
    {
      section: 2,
      subSection: 2,
      input: 'éléments',
      expected: false,
    },
    {
      section: 2,
      subSection: 2,
      input: 'eléments',
      expected: false,
    },
    {
      section: 2,
      subSection: 2,
      input: 'élements',
      expected: false,
    },
    {
      section: 2,
      subSection: 2,
      input: 'elements',
      expected: false,
    },
    {
      section: 2,
      subSection: 2,
      input: 'étiquetage',
      expected: false,
    },
    {
      section: 2,
      subSection: 2,
      input: 'etiquetage',
      expected: false,
    },
    {
      section: 3,
      subSection: 1,
      input: '3.1',
      expected: true,
    },
    {
      section: 3,
      subSection: 1,
      input: '3,1',
      expected: true,
    },
    {
      section: 3,
      subSection: 1,
      input: '3/1',
      expected: false,
    },
    {
      section: 3,
      subSection: 1,
      input: '3 1',
      expected: false,
    },
    {
      section: 3,
      subSection: 1,
      input: '31',
      expected: false,
    },
    {
      section: 3,
      subSection: 2,
      input: '3.2',
      expected: true,
    },
    {
      section: 3,
      subSection: 2,
      input: '3,2',
      expected: true,
    },
    {
      section: 3,
      subSection: 2,
      input: '3/2',
      expected: false,
    },
    {
      section: 3,
      subSection: 2,
      input: '3 2',
      expected: false,
    },
    {
      section: 3,
      subSection: 2,
      input: '32',
      expected: false,
    },
    {
      section: 9,
      subSection: 1,
      input: '9.1',
      expected: true,
    },
    {
      section: 9,
      subSection: 1,
      input: '9,1',
      expected: true,
    },
    {
      section: 9,
      subSection: 1,
      input: '9/1',
      expected: false,
    },
    {
      section: 9,
      subSection: 1,
      input: '9 1',
      expected: false,
    },
    {
      section: 9,
      subSection: 1,
      input: '91',
      expected: false,
    },
    {
      section: 9,
      subSection: 1,
      input: 'informationssurlespropriétésphysiquesetchimiques',
      expected: true,
    },
    {
      section: 9,
      subSection: 1,
      input: 'informationssurlesproprietésphysiquesetchimiques',
      expected: true,
    },
    {
      section: 9,
      subSection: 1,
      input: 'informationssurlespropriétesphysiquesetchimiques',
      expected: true,
    },
    {
      section: 9,
      subSection: 1,
      input: 'informationssurlesproprietesphysiquesetchimiques',
      expected: true,
    },
    {
      section: 9,
      subSection: 1,
      input: 'informationssurlespropriétés',
      expected: false,
    },
    {
      section: 9,
      subSection: 1,
      input: 'informationssurlesproprietés',
      expected: false,
    },
    {
      section: 9,
      subSection: 1,
      input: 'informationssurlespropriétes',
      expected: false,
    },
    {
      section: 9,
      subSection: 1,
      input: 'informationssurlesproprietes',
      expected: false,
    },
    {
      section: 9,
      subSection: 1,
      input: 'physiques',
      expected: false,
    },
    {
      section: 9,
      subSection: 1,
      input: 'chimiques',
      expected: false,
    },
    {
      section: 9,
      subSection: 1,
      input: 'physiquesetchimiques',
      expected: false,
    },
  ])(
    '$input for section $section and subsection $subsection should return $expected',
    ({ section, subSection, input, expected }: { section: number; subSection: number; input: string; expected: boolean }) => {
      const regex = _.find(SUB_SECTIONS_REGEX[section], ({ subSectionNumber }) => subSectionNumber === subSection)?.subSectionRegex;
      expect(regex).toBeDefined();
      expect(!!input.match(regex)).toEqual(expected);
    },
  );
});
