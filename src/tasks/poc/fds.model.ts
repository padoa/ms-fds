export type IPdfData = {
  Pages: Array<{
    Texts: IRawLine[];
  }>;
};

export type IRawLine = IBox & {
  w: number;
  sw: number;
  R: Array<{ T: string; S: number; TS: [number, number, number, number] }>;
};

export type IBox = {
  x: number;
  y: number;
};

export type IFDSTree = {
  [section: number]: ISection;
};

export type ISection = IBox & {
  subsections: {
    [subsection: number]: ISubsection;
  };
};

export type ISubsection = IBox & { lines: ILine[] };

export type ILine = IBox & {
  texts: IText[];
};

export type IText = IBox & {
  content: string;
  // width: number;
  // styleId: number;
};

export type IRawElement = IBox & {
  text?: string;
};

export type IXCounts = { [xPosition: number]: number };

export type ISubstance = {
  casNumber: string;
  ceNumber: string;
};
