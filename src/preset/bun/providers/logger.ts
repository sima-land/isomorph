/* eslint-disable jsdoc/require-jsdoc */
import { Resolve } from '../../../di';
import { Logger, createLogger } from '../../../log';
import { provideLogHandlerPino } from '../../node/providers/log-handler-pino';
import { provideLogHandlerSentry } from './log-handler-sentry';

export function provideLogger(resolve: Resolve): Logger {
  const logger = createLogger();

  logger.subscribe(provideLogHandlerPino(resolve));
  logger.subscribe(provideLogHandlerSentry(resolve));

  return logger;
}
