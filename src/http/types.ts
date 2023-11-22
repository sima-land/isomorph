export type { Handler, Enhancer, Middleware, CookieStore } from '@krutoo/fetch-tools';
export type {
  LogData,
  DoneLogData,
  FailLogData,
  LogHandler,
  LogHandlerFactory,
} from '@krutoo/fetch-tools/middleware';

export type URLSearchParamsInit = Record<string, string | number | boolean | undefined | null>;

export interface ResponseDone<T = unknown> {
  ok: true;
  data: T;
  error: null;
  status: number;
  statusText: string;
}

export interface ResponseFail<T = unknown> {
  ok: false;
  data?: T;
  error: unknown;
  status?: number;
  statusText?: string;
}

export type EitherResponse<T> = ResponseDone<T> | ResponseFail<T>;
