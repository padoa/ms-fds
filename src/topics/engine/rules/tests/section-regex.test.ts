import { describe, expect, it } from 'vitest';

import { SECTIONS_REGEX } from '@topics/engine/rules/rules.constants.js';

describe('Section regex tests', () => {
  it.each([
    {
      section: 1,
      input: 'rubrique1',
      expected: true,
    },
    {
      section: 1,
      input: 'rubrique1.1',
      expected: false,
    },
    {
      section: 1,
      input: 'rubrique1/1',
      expected: false,
    },
    {
      section: 1,
      input: 'rubrique',
      expected: false,
    },
    {
      section: 1,
      input: 'identificationdumelange',
      expected: true,
    },
    {
      section: 1,
      input: 'identificationdumélange',
      expected: true,
    },
    {
      section: 1,
      input: 'identification',
      expected: false,
    },
    {
      section: 1,
      input: 'dumelange',
      expected: false,
    },
    {
      section: 1,
      input: 'identificationdelasubstance',
      expected: true,
    },
    {
      section: 1,
      input: 'delasubstance',
      expected: false,
    },
    {
      section: 1,
      input: 'identificationduproduit',
      expected: true,
    },
    {
      section: 1,
      input: 'duproduit',
      expected: false,
    },
    {
      section: 2,
      input: 'identificationdesdangers',
      expected: true,
    },
    {
      section: 2,
      input: 'identification',
      expected: false,
    },
    {
      section: 2,
      input: 'desdangers',
      expected: false,
    },
    {
      section: 3,
      input: 'informationssurlescomposants',
      expected: true,
    },
    {
      section: 3,
      input: 'informationsurlescomposants',
      expected: true,
    },
    {
      section: 3,
      input: 'informationssurlesingredients',
      expected: true,
    },
    {
      section: 3,
      input: 'informationssurlesingrédients',
      expected: true,
    },
    {
      section: 3,
      input: 'informationsurlesingredients',
      expected: true,
    },
    {
      section: 3,
      input: 'informationsurlesingrédients',
      expected: true,
    },
    {
      section: 3,
      input: 'information',
      expected: false,
    },
    {
      section: 3,
      input: 'informations',
      expected: false,
    },
    {
      section: 3,
      input: 'surlescomposants',
      expected: false,
    },
    {
      section: 3,
      input: 'surlesingrédients',
      expected: false,
    },
    {
      section: 3,
      input: 'surlesingredients',
      expected: false,
    },
    {
      section: 4,
      input: 'premierssecours',
      expected: true,
    },
    {
      section: 4,
      input: 'premiers',
      expected: false,
    },
    {
      section: 4,
      input: 'secours',
      expected: false,
    },
    {
      section: 5,
      input: "mesuresdeluttecontrel'incendie",
      expected: true,
    },
    {
      section: 5,
      input: 'mesures',
      expected: false,
    },
    {
      section: 5,
      input: 'mesuresdelutte',
      expected: false,
    },
    {
      section: 5,
      input: "contrel'incendie",
      expected: false,
    },
    {
      section: 5,
      input: 'mesuresanti-incendie',
      expected: true,
    },
    {
      section: 5,
      input: 'mesuresantiincendie',
      expected: true,
    },
    {
      section: 5,
      input: 'antiincendie',
      expected: false,
    },
    {
      section: 5,
      input: 'anti-incendie',
      expected: false,
    },
    {
      section: 6,
      input: 'mesuresàprendreencasdedispersion',
      expected: true,
    },
    {
      section: 6,
      input: 'mesuresaprendreencasdedispersion',
      expected: true,
    },
    {
      section: 6,
      input: 'mesuresàprendreencasdedéversement',
      expected: true,
    },
    {
      section: 6,
      input: 'mesuresaprendreencasdedéversement',
      expected: true,
    },
    {
      section: 6,
      input: 'mesuresàprendreencasdedeversement',
      expected: true,
    },
    {
      section: 6,
      input: 'mesuresaprendreencasdedeversement',
      expected: true,
    },
    {
      section: 6,
      input: 'mesuresàprendreencasderejet',
      expected: true,
    },
    {
      section: 6,
      input: 'mesuresaprendreencasderejet',
      expected: true,
    },
    {
      section: 6,
      input: 'mesuresàprendre',
      expected: false,
    },
    {
      section: 6,
      input: 'mesuresaprendre',
      expected: false,
    },
    {
      section: 6,
      input: 'àprendreencasde',
      expected: false,
    },
    {
      section: 6,
      input: 'aprendreencasde',
      expected: false,
    },
    {
      section: 6,
      input: 'dispersion',
      expected: false,
    },
    {
      section: 6,
      input: 'déversement',
      expected: false,
    },
    {
      section: 6,
      input: 'deversement',
      expected: false,
    },
    {
      section: 6,
      input: 'rejet',
      expected: false,
    },
    {
      section: 7,
      input: 'manipulationetstockage',
      expected: true,
    },
    {
      section: 7,
      input: 'manipulation',
      expected: false,
    },
    {
      section: 7,
      input: 'stockage',
      expected: false,
    },
    {
      section: 8,
      input: "controledel'exposition",
      expected: true,
    },
    {
      section: 8,
      input: "contrôledel'exposition",
      expected: true,
    },
    {
      section: 8,
      input: "controlesdel'exposition",
      expected: true,
    },
    {
      section: 8,
      input: "contrôlesdel'exposition",
      expected: true,
    },
    {
      section: 8,
      input: 'controle',
      expected: false,
    },
    {
      section: 8,
      input: 'contrôle',
      expected: false,
    },
    {
      section: 8,
      input: 'controles',
      expected: false,
    },
    {
      section: 8,
      input: 'contrôles',
      expected: false,
    },
    {
      section: 8,
      input: "del'exposition",
      expected: false,
    },
    {
      section: 8,
      input: 'protectionindividuelle',
      expected: true,
    },
    {
      section: 8,
      input: 'protection',
      expected: false,
    },
    {
      section: 8,
      input: 'individuelle',
      expected: false,
    },
    {
      section: 9,
      input: 'propriétésphysiquesetchimiques',
      expected: true,
    },
    {
      section: 9,
      input: 'proprietésphysiquesetchimiques',
      expected: true,
    },

    {
      section: 9,
      input: 'propriétesphysiquesetchimiques',
      expected: true,
    },
    {
      section: 9,
      input: 'proprietesphysiquesetchimiques',
      expected: true,
    },
    {
      section: 9,
      input: 'propriétés',
      expected: false,
    },
    {
      section: 9,
      input: 'proprietés',
      expected: false,
    },

    {
      section: 9,
      input: 'propriétes',
      expected: false,
    },
    {
      section: 9,
      input: 'proprietes',
      expected: false,
    },
    {
      section: 9,
      input: 'physiques',
      expected: false,
    },
    {
      section: 9,
      input: 'chimiques',
      expected: false,
    },
    {
      section: 9,
      input: 'physiques et chimiques',
      expected: false,
    },
    {
      section: 10,
      input: 'stabilitéetréactivité',
      expected: true,
    },
    {
      section: 10,
      input: 'stabiliteetréactivité',
      expected: true,
    },
    {
      section: 10,
      input: 'stabilitéetreactivité',
      expected: true,
    },
    {
      section: 10,
      input: 'stabiliteetreactivité',
      expected: true,
    },
    {
      section: 10,
      input: 'stabilitéetréactivite',
      expected: true,
    },
    {
      section: 10,
      input: 'stabiliteetréactivite',
      expected: true,
    },
    {
      section: 10,
      input: 'stabilitéetreactivite',
      expected: true,
    },
    {
      section: 10,
      input: 'stabiliteetreactivite',
      expected: true,
    },
    {
      section: 10,
      input: 'stabilité',
      expected: false,
    },
    {
      section: 10,
      input: 'stabilite',
      expected: false,
    },
    {
      section: 10,
      input: 'réactivité',
      expected: false,
    },
    {
      section: 10,
      input: 'reactivité',
      expected: false,
    },
    {
      section: 10,
      input: 'réactivite',
      expected: false,
    },
    {
      section: 10,
      input: 'reactivite',
      expected: false,
    },
  ])('$input for section $section should return $expected', ({ section, input, expected }: { section: number; input: string; expected: boolean }) => {
    expect(!!input.match(SECTIONS_REGEX[section])).toEqual(expected);
  });
});
