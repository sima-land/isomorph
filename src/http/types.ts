export type { Handler, Enhancer, Middleware } from '@krutoo/fetch-tools';

// @todo здесь будет все и для клиентов и для серверов
// - мидлвари (клиент/сервер): log, validateStatus, defaultHeaders, collectCookie, jwt?, ...
// - хендлеры (сервер): healthCheck, ...
// - sauce (клиент): ???
// http-server и http-client постепенно станут deprecated
