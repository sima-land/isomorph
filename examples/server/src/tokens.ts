import { createToken } from '@sima-land/isomorph/di';
import type { Application, Handler } from 'express';
import type { Config, Api } from './types';

export const TOKEN = {
  // scope: root
  Root: {
    config: createToken<Config>('root/config'),
    mainServer: createToken<Application>('root/main-server'),
    mobileHandler: createToken<Handler>('root/mobile-handler'),
    desktopHandler: createToken<Handler>('root/desktop-handler'),
  },

  // scope: response
  Response: {
    api: createToken<Api>('response/api'),
  },
} as const;
