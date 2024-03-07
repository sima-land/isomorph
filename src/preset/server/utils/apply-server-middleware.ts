import type { ServerEnhancer, ServerMiddleware } from '../types';

/**
 * @inheritdoc
 * @internal
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
