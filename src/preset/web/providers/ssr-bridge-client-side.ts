import { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';
import { BridgeClientSide, SsrBridge } from '../../../utils/ssr';

/**
 * Провайдер клиентской части "моста" для передачи данных между сервером и клиентом.
 * @param resolve Функция для получения зависимости по токену.
 * @return Клиентская часть "моста".
 */
export function provideSsrBridgeClientSide(resolve: Resolve): BridgeClientSide<unknown> {
  const config = resolve(KnownToken.Config.base);

  return SsrBridge.resolve(config.appName);
}
