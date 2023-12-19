export type IMatchedText = {
  rawText: string;
  cleanText: string;
};

export type IJoinedTexts = IMatchedText;

export type IGetTextMatchingRegExpOptions = IMatchedText & {
  capturingGroup?: number;
};
