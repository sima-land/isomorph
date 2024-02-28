/**
 * На сервере между промежуточными слоями надо обмениваться данными поэтому появился такой интерфейс.
 * Возможно в будущем он перейдет в `@krutoo/fetch-tools`.
 */
export interface ServerHandlerContext {
  events: EventTarget;
}

export interface ServerHandler {
  (request: Request, context: ServerHandlerContext): Response | Promise<Response>;
}

export interface ServerEnhancer {
  (request: ServerHandler): ServerHandler;
}

export interface ServerMiddleware {
  (
    request: Request,
    next: (req: Request, ctx?: ServerHandlerContext) => Response | Promise<Response>,
    context: ServerHandlerContext,
  ): Response | Promise<Response>;
}
