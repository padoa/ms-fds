import type { IFdsTree, IXCounts } from '@topics/engine/model/fds.model.js';

export interface IBuildTree {
  fdsTree: IFdsTree;
  currentSection: number;
  currentSubSection: number;
  xCounts: IXCounts;
  fullText: string;
}

export interface IFdsTreeResult {
  fdsTree: IFdsTree;
  fullText: string;
  xCounts: IXCounts;
}
