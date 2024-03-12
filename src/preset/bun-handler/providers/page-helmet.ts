/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';
import { Fragment } from 'react';
import { RegularHelmet } from '../../server/utils/regular-helmet';
import { getPageResponseFormat } from '../../server/utils/get-page-response-format';

export function providePageHelmet(resolve: Resolve) {
  const config = resolve(KnownToken.Config.base);
  const { request } = resolve(KnownToken.Http.Handler.context);

  return config.env === 'development' && getPageResponseFormat(request) === 'html'
    ? RegularHelmet
    : Fragment;
}
