export type IMatchedText = {
  rawText: string;
  cleanText: string;
};

export type IGetTextMatchingRegExpOptions = IMatchedText & {
  capturingGroup?: number;
};
