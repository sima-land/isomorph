import { Fragment } from 'react';
import { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';
import { getPageResponseFormat } from '../../node/utils/get-page-response-format';
import { RegularHelmet } from '../../server/utils/regular-helmet';

/**
 * Провайдер helmet-компонента. Этот компонент является контейнером для результата render-функции.
 * @param resolve Функция для получения зависимости по токену.
 * @return Helmet-компонент.
 */
export function providePageHelmet(resolve: Resolve) {
  const config = resolve(KnownToken.Config.base);
  const { req } = resolve(KnownToken.ExpressHandler.context);

  return config.env === 'development' && getPageResponseFormat(req) === 'html'
    ? RegularHelmet
    : Fragment;
}
