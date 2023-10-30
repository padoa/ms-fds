import { AsyncLocalStorage } from '@padoa/async-local-storage';
import type { Logger } from '@padoa/logger';
import type { requestIdName } from '@padoa/meta';

export type Storage = {
  eventRule?: string;
  logExtraBase?: Record<string, unknown>;
  logger?: Logger;
  path?: string;
  [requestIdName]?: string;
  scope?: string;
  userId?: number;
};

export const asyncLocalStorage = new AsyncLocalStorage<Storage>();
