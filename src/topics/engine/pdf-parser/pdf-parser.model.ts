import type { ILine } from '@topics/engine/model/fds.model.js';

export interface IParseResult {
  lines: ILine[];
  fromImage: boolean;
}
