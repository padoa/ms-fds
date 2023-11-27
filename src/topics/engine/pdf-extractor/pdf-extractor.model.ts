import type { ILine, IPageDimension } from '@topics/engine/model/fds.model.js';

export interface IExtractorResult {
  lines: ILine[];
  pageDimension: IPageDimension;
}
