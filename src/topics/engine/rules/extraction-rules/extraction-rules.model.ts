export type IMatchedText = {
  rawText: string;
  cleanText: string;
};

/**
 * @param capturingGroup - The capturing group to return, starts at 1
 */
export type IGetTextMatchingRegExpOptions = IMatchedText & {
  capturingGroup?: number;
};
