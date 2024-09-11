/* eslint-disable jsdoc/require-jsdoc */
import { ServerHandler } from '../../server/types';
import { getStatsHandler } from '../utils/get-stats-handler';
import { getHealthCheck } from '../../server/utils/get-health-check';

export function provideServiceRoutes(): Array<[string, ServerHandler]> {
  return [
    // служебные маршруты (без промежуточных слоев)
    ['/healthcheck', getHealthCheck()],
    ['/stats', getStatsHandler()],
  ];
}
