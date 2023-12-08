import { format } from 'date-fns';
import _ from 'lodash';

import type { IExtractedDate } from '@topics/engine/model/fds.model.js';

export class RevisionDateRulesService {
  private static readonly MONTH_MAPPING = {
    août: 'august',
    février: 'february',
    décembre: 'december',
  } as { [key: string]: string };

  private static readonly noSingleDigitStartRegex = '(?<!\\d{1})';
  private static readonly dayRegex = '[1-9]|[12][0-9]|3[01]';
  private static readonly numberDayRegex = `0${this.dayRegex}`;
  private static readonly monthRegex = '(0[1-9]|1[0-2])';
  private static readonly yearRegex = '(19\\d{2}|20\\d{2}|\\d{2})';
  private static readonly dateSeparatorsRegex = '(\\/|-|\\.)';
  private static readonly stringMonthRegex = '[a-zA-ZÉÛéû]+';
  private static readonly spaceRegex = '\\s*';

  public static readonly numberDateRegex = `(${this.noSingleDigitStartRegex}(${this.numberDayRegex})${this.spaceRegex}${this.dateSeparatorsRegex}${this.spaceRegex}${this.monthRegex}${this.spaceRegex}${this.dateSeparatorsRegex}${this.spaceRegex}${this.yearRegex}(?!:\\d{2}))`;
  public static readonly stringDateRegex = `(${this.noSingleDigitStartRegex}(${this.dayRegex})${this.spaceRegex}-?(${this.stringMonthRegex})${this.spaceRegex}\\.?.?(19\\d{2}|20\\d{2}))`;
  public static readonly englishNumberDateRegex = `(${this.yearRegex}${this.spaceRegex}${this.dateSeparatorsRegex}${this.spaceRegex}${this.monthRegex}${this.spaceRegex}${this.dateSeparatorsRegex}${this.spaceRegex}(${this.numberDayRegex}))`;

  private static readonly dateRegexps = [this.numberDateRegex, this.stringDateRegex, this.englishNumberDateRegex];

  public static getDate(fullText: string): IExtractedDate {
    const inTextDate = this.getDateByRevisionText(fullText) || this.getDateByMostFrequent(fullText) || this.getDateByMostRecent(fullText);
    if (!inTextDate) return { formattedDate: null, inTextDate: null };
    const parsedDate = this.parseDate(inTextDate);

    return {
      formattedDate: parsedDate && !Number.isNaN(parsedDate.getTime()) ? format(parsedDate, 'yyyy/MM/dd') : null,
      inTextDate,
    };
  }

  public static getDateByRevisionText(fullText: string): string | null {
    const revisionDateRegex = `[R|r][é|e]vision${this.spaceRegex}.?${this.spaceRegex}`;

    for (const dateRegex of this.dateRegexps) {
      const revisionDateMatch = fullText.match(new RegExp(revisionDateRegex + dateRegex));
      if (revisionDateMatch?.length) return revisionDateMatch[1];
    }
    return null;
  }

  public static getDateByMostFrequent(fullText: string): string | undefined | null {
    const numberDates = fullText.match(new RegExp(this.numberDateRegex, 'g')) || [];
    const stringDates = fullText.match(new RegExp(this.stringDateRegex, 'g')) || [];
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
    return _.maxBy(mostUsedDates, (date) => this.parseDate(date));
  }

  public static getDateByMostRecent = (fullText: string): string | undefined => {
    const numberDates = fullText.match(new RegExp(this.numberDateRegex, 'g')) || [];
    const stringDates = fullText.match(new RegExp(this.stringDateRegex, 'g')) || [];
    const dates = [...numberDates, ...stringDates];
    return _.maxBy(dates, (date) => this.parseDate(date));
  };

  public static parseDate(date: string): Date | null {
    return this.parseDateFromNumberRegex(date) || this.parseDateFromStringRegex(date) || this.parseDateFromEnglishNumberRegex(date);
  }

  // TODO: refacto these blocs to avoid code duplication
  private static parseDateFromNumberRegex(date: string): Date | null {
    const regexMatches = date.match(new RegExp(this.numberDateRegex)); // TODO: refacto to not always recreate Regexp
    if (!regexMatches) return null;
    // eslint-disable-next-line prefer-const
    let [, , day, , month, , year] = regexMatches;
    if (year.length === 2) year = `${+year > 50 ? '19' : '20'}${year}`;
    return new Date(`${year}/${month}/${day}`);
  }

  private static parseDateFromStringRegex(date: string): Date | null {
    const regexMatches = date.match(new RegExp(this.stringDateRegex));
    if (!regexMatches) return null;
    const [, , day, month, year] = regexMatches;
    return new Date(`${year} ${this.MONTH_MAPPING[month] || month} ${day}`);
  }

  private static parseDateFromEnglishNumberRegex(date: string): Date | null {
    const regexMatches = date.match(new RegExp(this.englishNumberDateRegex));
    if (!regexMatches) return null;
    const [, , year, , month, , day] = regexMatches;
    return new Date(`${year} ${month} ${day}`);
  }
}
