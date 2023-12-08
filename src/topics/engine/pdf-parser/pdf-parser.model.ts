import type { ILine, IStroke } from '@topics/engine/model/fds.model.js';

export interface IParseResult {
  lines: ILine[];
  strokes: IStroke[];
  fromImage: boolean;
}
