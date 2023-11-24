import type { IFDSTree, IXCounts } from '@topics/engine/model/fds.model.js';

export interface IFDSTreeResult {
  fdsTree: IFDSTree;
  fullText: string;
  xCounts: IXCounts;
}
