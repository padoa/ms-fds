import type { ILine, IPageDimension } from '@topics/engine/model/fds.model.js';

export interface IParseResult {
  lines: ILine[];
  pageDimension: IPageDimension;
  fromImage: boolean;
}
