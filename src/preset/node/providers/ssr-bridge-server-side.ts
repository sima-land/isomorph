import type { Resolve } from '../../../di';
import { SsrBridge, BridgeServerSide } from '../../../utils/ssr';
import { KnownToken } from '../../../tokens';

/**
 * Провайдер серверной части "моста" для передачи данных между сервером и клиентом.
 * @param resolve Функция для получения зависимости по токену.
 * @return Серверная часть "моста".
 */
export function provideSsrBridgeServerSide(resolve: Resolve): BridgeServerSide {
  const config = resolve(KnownToken.Config.base);

  return SsrBridge.prepare(config.appName);
}
