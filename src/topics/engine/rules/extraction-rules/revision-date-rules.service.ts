import { format } from 'date-fns';
import _ from 'lodash';
import type { IExtractedDate } from '@padoa/chemical-risk';

import { CommonRegexRulesService } from '@topics/engine/rules/extraction-rules/common-regex-rules.service.js';
import { TextCleanerService } from '@topics/engine/text-cleaner.service.js';
import { ExtractionToolsService } from '@topics/engine/rules/extraction-rules/extraction-tools.service.js';

export class RevisionDateRulesService {
  private static readonly MONTH_MAPPING = {
    août: 'august',
    février: 'february',
    décembre: 'december',
  } as { [key: string]: string };

  private static readonly NO_SINGLE_DIGIT_START_REGEX = '(?<!\\d{1})';
  private static readonly DAY_REGEX = '[1-9]|[12][0-9]|3[01]';
  private static readonly NUMBER_DAY_REGEX = `0${this.DAY_REGEX}`;
  private static readonly MONTH_REGEX = '(0[1-9]|1[0-2])';
  private static readonly YEAR_REGEX = '(19\\d{2}|20\\d{2}|\\d{2})';
  private static readonly DATE_SEPARATOR_REGEX = '(\\/|-|\\.)';
  private static readonly STRING_MONTH_REGEX = '[a-zA-ZÉÛéû]+';

  public static readonly NUMBER_DATE_REGEX = `(${this.NO_SINGLE_DIGIT_START_REGEX}(${this.NUMBER_DAY_REGEX})${CommonRegexRulesService.SPACE_REGEX}${this.DATE_SEPARATOR_REGEX}${CommonRegexRulesService.SPACE_REGEX}${this.MONTH_REGEX}${CommonRegexRulesService.SPACE_REGEX}${this.DATE_SEPARATOR_REGEX}${CommonRegexRulesService.SPACE_REGEX}${this.YEAR_REGEX}(?!:\\d{2}))`;
  public static readonly STRING_DATE_REGEX = `(${this.NO_SINGLE_DIGIT_START_REGEX}(${this.DAY_REGEX})${CommonRegexRulesService.SPACE_REGEX}-?(${this.STRING_MONTH_REGEX})${CommonRegexRulesService.SPACE_REGEX}\\.?.?(19\\d{2}|20\\d{2}))`;
  public static readonly ENGLISH_NUMBER_DATE_REGEX = `(${this.YEAR_REGEX}${CommonRegexRulesService.SPACE_REGEX}${this.DATE_SEPARATOR_REGEX}${CommonRegexRulesService.SPACE_REGEX}${this.MONTH_REGEX}${CommonRegexRulesService.SPACE_REGEX}${this.DATE_SEPARATOR_REGEX}${CommonRegexRulesService.SPACE_REGEX}(${this.NUMBER_DAY_REGEX}))`;

  private static readonly DATE_REGEXPS = [this.NUMBER_DATE_REGEX, this.STRING_DATE_REGEX, this.ENGLISH_NUMBER_DATE_REGEX];

  public static getDate(rawFullText: string): IExtractedDate {
    const cleanedFullText = TextCleanerService.cleanRawText(rawFullText);

    const inTextDate =
      this.getDateByRevisionText(rawFullText, cleanedFullText) ||
      this.getDateByMostFrequent(rawFullText, cleanedFullText) ||
      this.getDateByMostRecent(rawFullText, cleanedFullText);
    if (!inTextDate) return { formattedDate: null, inTextDate: null };
    const parsedDate = this.parseDate(TextCleanerService.cleanRawText(inTextDate));

    return {
      formattedDate: parsedDate && !Number.isNaN(parsedDate.getTime()) ? format(parsedDate, 'yyyy/MM/dd') : null,
      inTextDate,
    };
  }

  public static getDateByRevisionText(rawFullText: string, cleanFullText: string): string | null {
    const revisionDateRegex = `(r[é|e]vision${CommonRegexRulesService.SPACE_REGEX}.?${CommonRegexRulesService.SPACE_REGEX})`;

    for (const dateRegex of this.DATE_REGEXPS) {
      const date = ExtractionToolsService.getTextMatchingRegExp(new RegExp(revisionDateRegex + dateRegex), {
        rawText: rawFullText,
        cleanText: cleanFullText,
        capturingGroup: 2,
      });
      if (!date) continue;
      return date.rawText;
    }

    return null;
  }

  public static getDateByMostFrequent(rawFullText: string, cleanFullText: string): string | null {
    const numberDatesMatches = ExtractionToolsService.getAllTextsMatchingRegExp(new RegExp(this.NUMBER_DATE_REGEX, 'g'), {
      rawText: rawFullText,
      cleanText: cleanFullText,
    });
    const stringDatesMatches = ExtractionToolsService.getAllTextsMatchingRegExp(new RegExp(this.STRING_DATE_REGEX, 'g'), {
      rawText: rawFullText,
      cleanText: cleanFullText,
    });
    const datesMatches = [...numberDatesMatches, ...stringDatesMatches];

    const dateCounts = _.reduce(
      datesMatches,
      (counts, dateMatch) => {
        const count = counts?.[dateMatch.cleanText]?.count || 0;
        return {
          ...counts,
          [dateMatch.cleanText]: {
            date: dateMatch.cleanText,
            count: count + 1,
          },
        };
      },
      {} as { [date: string]: { date: string; count: number } },
    );
    const maxCount = _.max(Object.values(dateCounts).map(({ count }) => count));
    if (maxCount < 3) return null;

    const mostMatchedDates = _.filter(datesMatches, (dateMatch) => dateCounts[dateMatch.cleanText].count === maxCount);
    const mostMatchedDate = _.maxBy(mostMatchedDates, (dateMatch) => this.parseDate(dateMatch.cleanText));
    return mostMatchedDate ? mostMatchedDate.rawText : null;
  }

  public static getDateByMostRecent = (rawFullText: string, cleanFullText: string): string | null => {
    const numberDatesMatches = ExtractionToolsService.getAllTextsMatchingRegExp(new RegExp(this.NUMBER_DATE_REGEX, 'g'), {
      rawText: rawFullText,
      cleanText: cleanFullText,
    });
    const stringDatesMatches = ExtractionToolsService.getAllTextsMatchingRegExp(new RegExp(this.STRING_DATE_REGEX, 'g'), {
      rawText: rawFullText,
      cleanText: cleanFullText,
    });
    const datesMatches = [...numberDatesMatches, ...stringDatesMatches];

    const mostMatchedDate = _.maxBy(datesMatches, (dateMatch) => this.parseDate(dateMatch.cleanText));
    return mostMatchedDate ? mostMatchedDate.rawText : null;
  };

  public static parseDate(date: string): Date | null {
    return this.parseDateFromNumberRegex(date) || this.parseDateFromStringRegex(date) || this.parseDateFromEnglishNumberRegex(date);
  }

  private static parseDateFromNumberRegex(date: string): Date | null {
    const regexMatches = date.match(new RegExp(this.NUMBER_DATE_REGEX));
    if (!regexMatches) return null;
    // eslint-disable-next-line prefer-const
    let [, , day, , month, , year] = regexMatches;
    if (year.length === 2) year = `${+year > 50 ? '19' : '20'}${year}`;
    return new Date(`${year}/${month}/${day}`);
  }

  private static parseDateFromStringRegex(date: string): Date | null {
    const regexMatches = date.match(new RegExp(this.STRING_DATE_REGEX));
    if (!regexMatches) return null;
    const [, , day, month, year] = regexMatches;
    return new Date(`${year} ${this.MONTH_MAPPING[month] || month} ${day}`);
  }

  private static parseDateFromEnglishNumberRegex(date: string): Date | null {
    const regexMatches = date.match(new RegExp(this.ENGLISH_NUMBER_DATE_REGEX));
    if (!regexMatches) return null;
    const [, , year, , month, , day] = regexMatches;
    return new Date(`${year} ${month} ${day}`);
  }
}
