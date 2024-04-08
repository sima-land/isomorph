import type express from 'express';

/**
 * Объединяет промежуточные слои в один.
 * @param list Промежуточные слои.
 * @return Промежуточный слой.
 */
export function composeMiddleware(list: express.Handler[]): express.Handler {
  return list.reduce((a, b) => (req, res, next) => {
    a(req, res, err => {
      if (err) {
        return next(err);
      }

      b(req, res, next);
    });
  });
}
