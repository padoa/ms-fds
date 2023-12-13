import _ from 'lodash';

import type { ILine, IStroke, IText } from '@topics/engine/model/fds.model.js';
import { VERTICAL_STROKE_MINIMAL_LENGTH } from '@topics/engine/pdf-extractor/pdf-stroke-extractor.config.js';

export class TableExtractionService {
  public static readonly CLOSE_VERTICAL_STROKE = 1 / 100;
  public static readonly COLUMN_ASSIGNMENT_TOLERANCE = 1 / 100;
  private static readonly MINIMUM_NUMBER_OF_COLUMNS = 2; // A table must at least have 2 columns

  //----------------------------------------------------------------------------------------------
  //------------------------------------ VERTICAL STROKE -----------------------------------------
  //----------------------------------------------------------------------------------------------

  public static getTableVerticalStrokes(strokes: IStroke[]): IStroke[] {
    if (_.isEmpty(strokes)) return [];

    const mergedStrokes = this.mergeStrokesVerticallyAligned(strokes);
    const verticalStrokes = this.filterVerticalStrokes(mergedStrokes);
    const verticalStrokesCleaned = this.filterCloseVerticalStrokes(verticalStrokes);
    const verticalStrokesCleanedAndSorted = _.sortBy(verticalStrokesCleaned, 'startBox.xPositionProportion');
    return verticalStrokesCleanedAndSorted.length >= this.MINIMUM_NUMBER_OF_COLUMNS + 1 ? verticalStrokesCleanedAndSorted : [];
  }

  public static mergeStrokesVerticallyAligned(strokes: IStroke[]): IStroke[] {
    const strokesGroupByX = _.groupBy(strokes, ({ startBox }) => `${startBox.pageNumber};${startBox.xPositionProportion}`);

    return _(strokesGroupByX)
      .map((_strokes) => {
        const minStrokeByYPositionProportion = _.minBy(_strokes, (stroke) => stroke.startBox.pageNumber * 100 + stroke.startBox.yPositionProportion);
        const maxStrokeByYPositionProportion = _.maxBy(_strokes, (stroke) => stroke.endBox.pageNumber * 100 + stroke.endBox.yPositionProportion);
        return {
          startBox: minStrokeByYPositionProportion.startBox,
          endBox: maxStrokeByYPositionProportion.endBox,
        };
      })
      .flatten()
      .value();
  }

  public static filterVerticalStrokes(strokes: IStroke[]): IStroke[] {
    return _(strokes)
      .filter(
        (stroke) =>
          Math.abs(stroke.endBox.xPositionProportion - stroke.startBox.xPositionProportion) <
            Math.abs(stroke.endBox.yPositionProportion - stroke.startBox.yPositionProportion) ||
          Math.abs(stroke.endBox.yPositionProportion - stroke.startBox.yPositionProportion) >= VERTICAL_STROKE_MINIMAL_LENGTH,
      )
      .value();
  }

  public static filterCloseVerticalStrokes(strokes: IStroke[]): IStroke[] {
    return _.reduce(
      strokes,
      (mergedStrokes, stroke) => {
        for (const mergedStroke of mergedStrokes) {
          if (this.areVerticalStrokesClose(stroke, mergedStroke)) return mergedStrokes;
        }
        mergedStrokes.push(stroke);
        return mergedStrokes;
      },
      [] as IStroke[],
    );
  }

  public static areVerticalStrokesClose(strokeA: IStroke, strokeB: IStroke): boolean {
    return Math.abs(strokeA.startBox.xPositionProportion - strokeB.startBox.xPositionProportion) < this.CLOSE_VERTICAL_STROKE;
  }

  //----------------------------------------------------------------------------------------------
  //------------------------------------ LINE IN COLUMNS -----------------------------------------
  //----------------------------------------------------------------------------------------------

  public static splitLinesInColumns(lines: ILine[], tableVerticalStrokes: IStroke[]): IText[][][] {
    if (_.isEmpty(tableVerticalStrokes)) return [_.map(lines, 'texts')];

    return _.reduce(
      lines,
      (textsSplittedByColumns, line) => {
        const textsSplittedInColumns = this.splitLineInColumn(line, tableVerticalStrokes);
        _.forEach(textsSplittedInColumns, (texts, column) => {
          textsSplittedByColumns[column].push(texts);
        });
        return textsSplittedByColumns;
      },
      _.times(tableVerticalStrokes.length + 1, () => []) as IText[][][],
    );
  }

  public static splitLineInColumn(line: ILine, tableVerticalStrokes: IStroke[]): IText[][] {
    return _.reduce(
      line.texts,
      (linesSplittedByColumns, text) => {
        let index = _.findIndex(
          tableVerticalStrokes,
          (stroke) => stroke.startBox.xPositionProportion > text.xPositionProportion + this.COLUMN_ASSIGNMENT_TOLERANCE,
        );
        if (index === -1) index = tableVerticalStrokes.length;
        linesSplittedByColumns[index].push(text);
        return linesSplittedByColumns;
      },
      _.times(tableVerticalStrokes.length + 1, () => []) as IText[][],
    );
  }
}
