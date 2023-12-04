export class ExtractionCleanerService {
  public static trimAndCleanTrailingDot(text: string): string {
    const textTrimmed = text.trim();
    if (!textTrimmed?.endsWith('.')) return textTrimmed;
    const producerSplit = textTrimmed.split(/ |\.|-/);
    const wordBeforePoint = producerSplit[producerSplit.length - 2];
    const wordBeforePointIsAChar = wordBeforePoint?.length === 1;

    if (wordBeforePointIsAChar) return textTrimmed;
    return textTrimmed.slice(0, -1);
  }
}
