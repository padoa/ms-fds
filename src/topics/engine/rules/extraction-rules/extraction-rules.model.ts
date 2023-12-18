export type IMatchedText = {
  rawText: string;
  cleanText: string;
};

export type IGetRawTextMatchingRegExp = IMatchedText & {
  regExp: RegExp;
  capturingGroup?: number;
};
