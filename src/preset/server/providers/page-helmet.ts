import { Fragment } from 'react';
import { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';
import { RegularHelmet } from '../utils/regular-helmet';
import { PAGE_FORMAT_PRIORITY } from '../constants';

/**
 * Провайдер helmet-компонента. Этот компонент является контейнером для результата render-функции.
 * @param resolve Функция для получения зависимости по токену.
 * @return Helmet-компонент.
 */
export function providePageHelmet(resolve: Resolve) {
  const config = resolve(KnownToken.Config.base);
  const acceptType = resolve(KnownToken.Http.Handler.Request.acceptType);

  return config.env === 'development' && acceptType(PAGE_FORMAT_PRIORITY) === 'html'
    ? RegularHelmet
    : Fragment;
}
