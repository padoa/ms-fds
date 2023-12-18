import { RAW_H_DANGER, RAW_P_DANGER } from '@topics/engine/__fixtures__/fixtures.constants.js';
import { DangerBuilder } from '@topics/engine/rules/extraction-rules/__tests__/__fixtures__/danger.builder.js';

export const aDanger = (): DangerBuilder => new DangerBuilder();

export const aHDanger = (): DangerBuilder => aDanger().withCode(RAW_H_DANGER);
export const aPDanger = (): DangerBuilder => aDanger().withCode(RAW_P_DANGER);
