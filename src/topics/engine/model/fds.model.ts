//----------------------------------------------------------------------------------------------
//------------------------------------ RAW DATA TYPES ------------------------------------------
//----------------------------------------------------------------------------------------------

export type IPdfData = {
  Pages: Array<{
    Height: number;
    Width: number;
    Texts: IRawLine[];
  }>;
};

export type IRawBox = {
  x: number;
  y: number;
};

export type IRawLine = IRawBox & {
  w: number;
  sw: number;
  R: Array<{ T: string; S: number; TS: [number, number, number, number] }>;
};

export type IBox = {
  xPositionInPercent: number;
  yPositionInPercent: number;
};

export type IPageDimension = {
  width: number;
  height: number;
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

export type IMetaData = {
  pageNumber: number;
  startBox: IBox;
  endBox?: IBox;
};

export type ILine = IMetaData & {
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

export type IExtractedProduct = { name: string; metaData: IMetaData };

export type IExtractedProducer = { name: string; metaData: IMetaData };

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
