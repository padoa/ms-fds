import type { IBox, IMetaData, IPosition } from '@padoa/chemical-risk';

export type IPdfData = {
  Pages: Array<{
    Height: number;
    Width: number;
    VLines: IRawStroke[];
    HLines: IRawStroke[];
    Fills: IFill[];
    Texts: IRawLine[];
  }>;
};

export type IRawPosition = {
  x: number;
  y: number;
};

export type IRawStroke = IRawPosition & {
  w: number;
  l: number;
};

export type IFill = IRawPosition & {
  w: number;
  h: number;
};

export type IRawLine = IRawPosition & {
  w: number;
  sw: number;
  R: Array<{ T: string; S: number; TS: [number, number, number, number] }>;
};

export type IRawElement = IPosition & {
  text?: string;
};

export type IPageDimension = {
  width: number;
  height: number;
};

export type IFdsTree = {
  [section: number]: ISection;
};

export type ISection = IBox & {
  subsections: {
    [subsection: number]: ISubsection;
  };
};

export type ISubsection = IBox & { lines: ILine[]; strokes: IStroke[] };

export type IStroke = IBox;

export type ILine = IMetaData & {
  texts: IText[];
};

export type IText = IPosition & {
  rawContent: string;
  cleanContent: string;
};

export type IXCounts = { [xPosition: number]: number };
