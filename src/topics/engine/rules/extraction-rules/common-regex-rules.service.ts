export class CommonRegexRulesService {
  public static readonly SPACE_REGEX = '\\s*';

  public static readonly NUMBER_WITH_OPTIONAL_DECIMAL_REGEX = `\\d+${CommonRegexRulesService.SPACE_REGEX}((\\.|,)${CommonRegexRulesService.SPACE_REGEX}\\d+${CommonRegexRulesService.SPACE_REGEX})?`;

  public static readonly ORDER_OPERATORS_REGEX = `(<|>|<=|>=|≤|≥|sup[é|e]rieur[e]?(${this.SPACE_REGEX}[à])?|inf[e|é]rieur[e]?(${this.SPACE_REGEX}[à])?)`;

  public static readonly TEMPERATURE_UNITS_REGEX = `°${CommonRegexRulesService.SPACE_REGEX}[c|k|f]`;
}
