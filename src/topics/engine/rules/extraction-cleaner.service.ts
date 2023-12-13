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

  public static cleanSpaces(text: string): string {
    return text?.replaceAll(' ', '');
  }

  public static trimAndCleanMultipleSpaces(text: string): string {
    return text.trim().replaceAll(/\s+/g, ' ');
  }
}
