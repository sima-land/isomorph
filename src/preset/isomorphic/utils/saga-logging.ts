import { DetailedError, type Logger } from '../../../log';
import type { SagaMiddlewareHandler } from '../../../utils/redux-saga';
import type { SagaErrorInfo, SagaInterruptInfo } from '../../../utils/redux-saga/types';

/**
 * Лог событий запуска и выполнения redux-saga.
 */
export class SagaLogging implements SagaMiddlewareHandler {
  protected logger: Logger;

  /**
   * @param logger Logger.
   */
  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * При получении ошибки выполнения саги передаст ее логгеру ее с данными стека в extra.
   * @param error Ошибка.
   * @param info Инфо выполнения саги.
   */
  onSagaError(error: Error, info: SagaErrorInfo) {
    this.logger.error(
      new DetailedError(error.message, {
        extra: {
          key: 'Saga stack',
          data: info.sagaStack,
        },
      }),
    );
  }

  /**
   * При получении ошибки запуска саги передаст ее логгеру.
   * @param error Ошибка.
   */
  onConfigError(error: Error) {
    this.logger.error(error);
  }

  /**
   * При прерывании саги передаст информацию логгеру как ошибку.
   * @param info Инфо прерывания саги.
   */
  onTimeoutInterrupt({ timeout }: SagaInterruptInfo) {
    this.logger.error(
      new DetailedError(`Сага прервана по таймауту (${timeout}мс)`, {
        level: 'warning',
      }),
    );
  }
}
