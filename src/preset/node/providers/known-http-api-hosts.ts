import type { Resolve } from '../../../di';
import type { KnownHttpApiKey } from '../../isomorphic';
import { KnownToken } from '../../../tokens';
import { HttpApiHostPool } from '../../isomorphic/utils/http-api-host-pool';

/**
 * Провайдер известных http-хостов.
 * @param resolve Функция для получения зависимости по токену.
 * @return Пул известных http-хостов.
 */
export function provideKnownHttpApiHosts(resolve: Resolve): HttpApiHostPool<KnownHttpApiKey> {
  const source = resolve(KnownToken.Config.source);

  return new HttpApiHostPool(
    {
      ilium: 'API_URL_ILIUM',
      simaV3: 'API_URL_SIMALAND_V3',
      simaV4: 'API_URL_SIMALAND_V4',
      simaV6: 'API_URL_SIMALAND_V6',
      chponkiV2: 'API_URL_CHPONKI_V2',
    },
    source,
  );
}
