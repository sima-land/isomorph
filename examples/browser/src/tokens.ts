import { createToken } from '@sima-land/isomorph/di';
import { KnownToken } from '../../../dist/tokens';
import type { Config, Api } from './types';

export const TOKEN = {
  Lib: KnownToken,
  Project: {
    config: createToken<Config>('app/config'),
    api: createToken<Api>('app/api'),
  },
} as const;
