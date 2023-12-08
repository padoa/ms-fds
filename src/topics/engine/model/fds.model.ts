//----------------------------------------------------------------------------------------------
//------------------------------------ RAW DATA TYPES ------------------------------------------
//----------------------------------------------------------------------------------------------

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

export type IRawStroke = {
  x: number;
  y: number;
  w: number;
  l: number;
};

export type IFill = {
  x: number;
  y: number;
  w: number;
  h: number;
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

export type IRawElement = IPosition & {
  text?: string;
};

export type IPosition = {
  pageNumber: number;
  xPositionProportion: number;
  yPositionProportion: number;
};

export type IBox = {
  startBox: IPosition;
  endBox?: IPosition;
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

export type IMetaData = IBox;

export type IText = IPosition & {
  content: string;
};

export type IXCounts = { [xPosition: number]: number };

//----------------------------------------------------------------------------------------------
//--------------------------------- EXTRACTED DATA TYPES ---------------------------------------
//----------------------------------------------------------------------------------------------

export type IExtractedDate = { formattedDate: string; inTextDate: string };

export type IExtractedProduct = { name: string; metaData: IMetaData };

export type IExtractedProducer = { name: string; metaData: IMetaData };

export type IExtractedDanger = { code: string; metaData: IMetaData };

export type IExtractedSubstance = {
  casNumber: string;
  ceNumber: string;
  metaData: IMetaData;
};

export type IExtractedPhysicalState = { value: string; metaData: IMetaData };

export type IExtractedData = {
  date: IExtractedDate;
  product: IExtractedProduct;
  producer: IExtractedProducer;
  dangers: IExtractedDanger[];
  substances: IExtractedSubstance[];
  physicalState: IExtractedPhysicalState;
};
