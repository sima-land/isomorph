import type { Handler } from 'express';

/**
 * Обработчик, отвечающий данными о времени работы приложения.
 * @return Обработчик http-запроса.
 */
export function healthCheck(): Handler {
  const startTime = Date.now();

  return (req, res) => {
    res.json({ uptime: Date.now() - startTime });
  };
}
