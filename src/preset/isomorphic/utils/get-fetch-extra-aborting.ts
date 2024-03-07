import type { Middleware } from '../../../http';

/**
 * Возвращает новый промежуточный слой обрывания по заданному контроллеру.
 * Учитывает передачу контроллера в запросе.
 * @param controller Контроллер.
 * @return Промежуточный слой.
 */
export function getFetchExtraAborting(controller: AbortController): Middleware {
  return (request, next) => {
    const innerController = new AbortController();

    request.signal?.addEventListener(
      'abort',
      () => {
        innerController.abort();
      },
      { once: true },
    );

    controller.signal.addEventListener(
      'abort',
      () => {
        innerController.abort();
      },
      { once: true },
    );

    return next(new Request(request, { signal: innerController.signal }));
  };
}
