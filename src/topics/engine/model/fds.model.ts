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

export type ILine = {
  texts: IText[];
  pageNumber: number;
  startBox: IBox;
  endBox?: IBox;
};

export type IText = IBox & {
  content: string;
};

export type IRawElement = IBox & {
  text?: string;
};

export type IXCounts = { [xPosition: number]: number };

export type IPageDimension = {
  width: number;
  height: number;
};

export type IRatioXY = {
  ratioX: number;
  ratioY: number;
};

export type IMetaData = {
  pageNumber: number;
  startBoxRatio: IRatioXY;
  endBoxRatio?: IRatioXY;
};

//----------------------------------------------------------------------------------------------
//--------------------------------- EXTRACTED DATA TYPES ---------------------------------------
//----------------------------------------------------------------------------------------------

export type IExtractedDate = { formattedDate: string; inTextDate: string };

export type IExtractedProduct = { text: string; metaData: IMetaData };

export type IExtractedProducer = { text: string; metaData: IMetaData };

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
