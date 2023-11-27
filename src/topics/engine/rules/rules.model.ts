import type { IBox } from '@topics/engine/model/fds.model.js';

export interface IInterestingSection {
  interestingSection: boolean;
  sectionNumber: number;
}

export interface IInterestingSubSection {
  interestingSubSection: boolean;
  subSectionNumber?: number;
}

export interface IExtractedElement {
  text: string;
  pageNumber: number;
  startBox: IBox;
  endBox?: IBox;
}
