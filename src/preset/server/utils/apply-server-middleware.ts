import type { ServerEnhancer, ServerMiddleware } from '../types';

/**
 * Возвращает Enhancer который накидывает на обработчик промежуточные слои.
 * В будущем может быть перенесен в `@krutoo/fetch-tools` в более абстрактном виде.
 * @inheritdoc
 */
export function applyServerMiddleware(...list: ServerMiddleware[]): ServerEnhancer {
  return handler => {
    let result = handler;

    for (const item of list.reverse()) {
      const next = result;
      result = async (request, context) =>
        item(request, (req, ctx) => next(req, ctx ?? context), context);
    }

    return result;
  };
}
