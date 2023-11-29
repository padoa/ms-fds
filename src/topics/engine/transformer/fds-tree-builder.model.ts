import type { IFDSTree, IXCounts } from '@topics/engine/model/fds.model.js';

export interface IBuildTree {
  fdsTree: IFDSTree;
  currentSection: number;
  currentSubSection: number;
  xCounts: IXCounts;
  fullText: string;
}

export interface IFDSTreeResult {
  fdsTree: IFDSTree;
  fullText: string;
  xCounts: IXCounts;
}
