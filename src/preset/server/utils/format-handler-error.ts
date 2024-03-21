import { ResponseError } from '../../../http';
import { LogLevel } from '../../../log';

/**
 * Функция форматирования ошибки обработчика запроса.
 * @param error Ошибка.
 * @return Формат ответа и лога ошибки.
 */
export function formatHandlerError(error: unknown) {
  let logLevel: LogLevel | null = 'error';
  let message: string;
  let statusCode = 500; // по умолчанию, если на этапе подготовки страницы что-то не так, отдаем 500
  let redirectLocation: string | null = null;

  if (error instanceof Error) {
    message = error.message;

    if (error instanceof ResponseError) {
      statusCode = error.statusCode;
      redirectLocation = error.redirectLocation;
      logLevel = error.logLevel;
    }
  } else {
    message = String(error);
  }

  return {
    response: {
      status: statusCode,
      body: message,
      redirectLocation,
    },
    log: {
      level: logLevel,
      message,
    },
  };
}
