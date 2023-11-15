//----------------------------------------------------------------------------------------------
//------------------------------------ RAW DATA TYPES ------------------------------------------
//----------------------------------------------------------------------------------------------

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
};

export type IRawElement = IBox & {
  text?: string;
};

export type IXCounts = { [xPosition: number]: number };

//----------------------------------------------------------------------------------------------
//--------------------------------- EXTRACTED DATA TYPES ---------------------------------------
//----------------------------------------------------------------------------------------------

export type IExtractedDate = { formattedDate: string; inTextDate: string };

export type IExtractedProduct = string;

export type IExtractedProducer = string;

export type IExtractedHazard = string;

export type IExtractedSubstance = {
  casNumber: string;
  ceNumber: string;
};

export type IExtractedData = {
  date: IExtractedDate;
  product: IExtractedProduct;
  producer: IExtractedProducer;
  hazards: IExtractedHazard[];
  substances: IExtractedSubstance[];
};
