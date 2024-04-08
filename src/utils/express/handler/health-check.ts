import type express from 'express';

/**
 * Возвращает обработчик, отвечающий данными о времени работы приложения.
 * @return Обработчик http-запроса.
 */
export function healthCheck(): express.Handler {
  const startTime = Date.now();

  return (req, res) => {
    res.json({ uptime: Date.now() - startTime });
  };
}
