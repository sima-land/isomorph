import { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';
import { KnownHttpApiKey } from '../../isomorphic/types';
import { HttpApiHostPool } from '../../isomorphic/utils/http-api-host-pool';

/**
 * Провайдер известных http-хостов.
 * @param resolve Функция для получения зависимости по токену.
 * @return Пул известных http-хостов.
 */
export function provideKnownHttpApiHosts(resolve: Resolve): HttpApiHostPool<KnownHttpApiKey> {
  const source = resolve(KnownToken.Config.source);

  return new HttpApiHostPool<KnownHttpApiKey>(
    {
      ilium: 'PUBLIC_API_URL_ILIUM',
      simaV3: 'PUBLIC_API_URL_SIMALAND_V3',
      simaV4: 'PUBLIC_API_URL_SIMALAND_V4',
      simaV6: 'PUBLIC_API_URL_SIMALAND_V6',
      chponkiV2: 'PUBLIC_API_URL_CHPONKI_V2',
      shuttle: 'PUBLIC_API_URL_SHUTTLE',
      fileDispatcher: 'PUBLIC_API_URL_FILE_DISPATCHER',
    },
    source,
  );
}
