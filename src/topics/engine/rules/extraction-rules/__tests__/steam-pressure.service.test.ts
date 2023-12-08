import { describe, expect, it } from 'vitest';

import { SteamPressureService } from '@topics/engine/rules/extraction-rules/steam-pressure.service.js';
import type { IExtractedSteamPressure, IFdsTree, IMetaData } from '@topics/engine/model/fds.model.js';
import { aFdsTree, aFdsTreeWithAllSectionsWithoutUsefulInfo, anEmptyFdsTreeWithAllSections } from '@topics/engine/__fixtures__/fds-tree.mother.js';
import { aSection } from '@topics/engine/__fixtures__/section.mother.js';
import { aSubSection } from '@topics/engine/__fixtures__/sub-section.mother.js';
import { aLine, aLineWithSteamPressureIdentifierAndValue } from '@topics/engine/__fixtures__/line.mother.js';
import { aPosition } from '@topics/engine/__fixtures__/position.mother.js';
import { STEAM_PRESSURE_TEMPERATURE, STEAM_PRESSURE_VALUE } from '@topics/engine/__fixtures__/fixtures.constants.js';
import { aTextWithSteamPressureIdentifier, aTextWithSteamPressureValue } from '@topics/engine/__fixtures__/text.mother.js';

describe('SteamPressureService tests', () => {
  const metaData: IMetaData = { startBox: aPosition().properties };

  describe('Regexps tests', () => {
    describe('STEAM_PRESSURE_IDENTIFIER_REGEX tests', () => {
      it.each<{ input: string; expected: boolean }>([
        { input: 'pressiondevapeur', expected: true },
        { input: 'pressionde vapeur', expected: true },
        { input: 'pression de vapeur', expected: true },
        { input: 'pressionvapeur', expected: true },
        { input: 'pression vapeur', expected: true },
        { input: 'pression', expected: false },
      ])('should return $expected with input $input', ({ input, expected }) => {
        expect(new RegExp(SteamPressureService.STEAM_PRESSURE_IDENTIFIER_REGEX).test(input)).toEqual(expected);
      });
    });

    describe('STEAM_PRESSURE_VALUE_REGEX tests', () => {
      it.each<{ input: string; expected: boolean }>([
        { input: '3 bar', expected: true },
        { input: '3bar', expected: true },
        { input: '15.9 kpa', expected: true },
        { input: '159,4 pa', expected: true },
        { input: '60 , 8 mbar', expected: true },
        { input: '15hpa', expected: true },
        { input: '> 5 hpa', expected: true },
        { input: '<3bar', expected: true },
        { input: '>= 4 kpa', expected: true },
        { input: '<= 5.2 bar', expected: true },
        { input: '<= 1 . 3 kpa', expected: true },
        { input: '≤ 52 pa ', expected: true },
        { input: '≥3bar', expected: true },
        { input: 'supérieur 2 bar', expected: true },
        { input: 'supérieure 2 bar', expected: true },
        { input: 'supérieur à 2 bar', expected: true },
        { input: 'supérieure à 300 kpa', expected: true },
        { input: 'inférieur 2 pa', expected: true },
        { input: 'inférieure 2 pa', expected: true },
        { input: 'inférieur à 2 pa', expected: true },
        { input: 'inférieure à 2 pa', expected: true },
        { input: '3 xyz', expected: false },
        { input: '3. bar', expected: false },
        { input: '3, bar', expected: false },
        { input: '> pa', expected: false },
      ])('should return $expected with input $input', ({ input, expected }) => {
        expect(new RegExp(SteamPressureService.STEAM_PRESSURE_VALUE_REGEX).test(input)).toEqual(expected);
      });
    });

    describe('TEMPERATURE_VALUE_REGEX tests', () => {
      it.each<{ input: string; expected: boolean }>([
        { input: '(5 °c)', expected: true },
        { input: '[150 °c]', expected: true },
        { input: '250,20 °c', expected: true },
        { input: '250.20 °c', expected: true },
        { input: '450,20°c', expected: true },
        { input: '50,50 °c', expected: true },
        { input: '50, 50 °c', expected: true },
        { input: '20 °f', expected: true },
        { input: '20 °k', expected: true },
        { input: '20 ° k', expected: true },
        { input: '50,0430402040204204°c', expected: true },
        { input: '200 . 20 ° c', expected: true },
        { input: '°c', expected: false },
        { input: '50 °', expected: false },
        { input: '50 c', expected: false },
        { input: '50, °c', expected: false },
        { input: '50. °c', expected: false },
      ])('should return $expected with input $input', ({ input, expected }) => {
        expect(new RegExp(SteamPressureService.TEMPERATURE_VALUE_REGEX).test(input)).toEqual(expected);
      });
    });
  });

  describe('GetSteamPressure tests', () => {
    it.each<[{ message: string; fdsTree: IFdsTree; expected: IExtractedSteamPressure }]>([
      [
        {
          message: 'it should return null when given a fds tree without lines',
          fdsTree: aFdsTree().properties,
          expected: null,
        },
      ],
      [
        {
          message: 'it should return null when given an empty fds tree',
          fdsTree: anEmptyFdsTreeWithAllSections().properties,
          expected: null,
        },
      ],
      [
        {
          message: 'it should return null when given a text without steam pressure',
          fdsTree: aFdsTreeWithAllSectionsWithoutUsefulInfo().properties,
          expected: null,
        },
      ],
      [
        {
          message: 'it should return steam pressure when it is contained in 2 texts',
          fdsTree: aFdsTree().withSection9(
            aSection().withSubsections({
              1: aSubSection().withLines([aLineWithSteamPressureIdentifierAndValue().properties]).properties,
            }).properties,
          ).properties,
          expected: { pressure: STEAM_PRESSURE_VALUE, temperature: STEAM_PRESSURE_TEMPERATURE, metaData },
        },
      ],
      [
        {
          message: 'it should return steam pressure even when temperature is missing',
          fdsTree: aFdsTree().withSection9(
            aSection().withSubsections({
              1: aSubSection().withLines([
                aLine().withTexts([aTextWithSteamPressureIdentifier().properties, aTextWithSteamPressureValue().properties]).properties,
              ]).properties,
            }).properties,
          ).properties,
          expected: { pressure: STEAM_PRESSURE_VALUE, temperature: undefined, metaData },
        },
      ],
      [
        {
          message: 'it should skip first identifier if there is no steam pressure value',
          fdsTree: aFdsTree().withSection9(
            aSection().withSubsections({
              1: aSubSection().withLines([
                aLine().withTexts([aTextWithSteamPressureIdentifier().properties]).properties,
                aLineWithSteamPressureIdentifierAndValue().properties,
              ]).properties,
            }).properties,
          ).properties,
          expected: { pressure: STEAM_PRESSURE_VALUE, temperature: STEAM_PRESSURE_TEMPERATURE, metaData },
        },
      ],
    ])('$message', ({ fdsTree, expected }) => {
      expect(SteamPressureService.getSteamPressure(fdsTree)).toEqual(expected);
    });
  });
});
