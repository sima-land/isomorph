import type { PageAssets } from '../isomorphic';

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

export interface PageResponseFormatResult {
  body: string;
  headers: Headers;
}

export interface PageResponseFormatter {
  (
    jsx: JSX.Element,
    assets: PageAssets,
  ): PageResponseFormatResult | Promise<PageResponseFormatResult>;
}

export interface RenderToString {
  (jsx: JSX.Element): string | Promise<string>;
}

export interface RouteInfo {
  method: 'all' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';
  path: string;
}

export type RouteList = Array<[string | RouteInfo, ServerHandler]>;
