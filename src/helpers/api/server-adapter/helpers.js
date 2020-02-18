import isArrayBuffer from 'lodash/isArrayBuffer';
import isFunction from 'lodash/isFunction';
import isString from 'lodash/isString';
import pipe from 'lodash/fp/pipe';
import get from 'lodash/fp/get';
import eq from 'lodash/fp/eq';

import { http as httpFollow, https as httpsFollow } from 'follow-redirects';
import http from 'http';
import https from 'https';
import zlib from 'zlib';

/**
 * Проверяет, что переданный аргумент поддерживает метод экземпляра Stream.
 */
export const isStream = pipe(
  get('pipe'),
  isFunction
);

/**
 * Проверяет, что переданный аргумент поддерживает метод экземпляра EventEmitter.
 */
export const isEventEmitter = pipe(
  get('emit'),
  isFunction
);

/**
 * Проверяет, что переданный аргумент соответствует протоколу `https`.
 */
export const isHttps = eq('https:');

/**
 * Возвращает экземпляр Buffer созданный из переданных данных.
 * @param {Buffer|ArrayBuffer|string} data Данные.
 * @return {Buffer|undefined} Данные.
 */
export const prepareDataBuffer = data => {
  let result;
  if (isString(data)) {
    result = Buffer.from(data, 'utf-8');
  } else if (Buffer.isBuffer(data)) {
    result = data;
  } else if (isArrayBuffer(data)) {
    result = Buffer.from(new Uint8Array(data));
  }
  return result;
};

/**
 * Создает экземпляр URL из объединенного пути с базой. Если путь абсолютный - использует только его.
 * @param {string} input Путь для объединения.
 * @param {string} base База.
 * @return {URL} Объект URL.
 */
export const createConcatURL = (input, base) => {
  const cleanInput = input ? input.replace(/^\/(?!\/)/, '') : '';
  const cleanBase = base ? base.replace(/\/?$/, '/') : undefined;
  return new URL(cleanInput, cleanBase);
};

/**
 * Возвращает подходящий интерфейс транспорта в зависимости от конфигурации.
 * @param {Object} config Конфигурация.
 * @param {string} config.url Относительный URL запроса.
 * @param {string} config.baseURL Базовый URL.
 * @param {Object} config.transport Кастомный транспорт, переданный в конфигурации.
 * @param {number} config.maxRedirects Максимальное количество редиректов.
 * @return {Object} Транспорт.
 */
export const createTransport = ({
  url,
  baseURL,
  transport,
  maxRedirects,
}) => {
  const { protocol } = createConcatURL(url, baseURL);
  const isHttpsRequest = isHttps(protocol);

  let result;
  if (transport) {
    result = transport;
  } else if (maxRedirects === 0) {
    result = isHttpsRequest ? https : http;
  } else {
    result = isHttpsRequest ? httpsFollow : httpFollow;
  }
  return result;
};

/**
 * Объединяет имеющиеся параметры запроса с переданными и возвращает сериализованный путь с параметрами запроса.
 * @param {URL} url Экземпляр URL.
 * @param {Object|string|URLSearchParams} [params] Параметры запроса.
 * @param {Function} [paramsSerializer] Функция для сериализации переданных параметров.
 * @return {string} Путь с параметрами.
 */
export const buildRequestPath = (url, params, paramsSerializer) => {
  const outlineSearchParams = new URLSearchParams(
    isFunction(paramsSerializer)
      ? paramsSerializer(params)
      : params
  );
  outlineSearchParams.forEach((value, name) => url.searchParams.append(name, value));
  return url.href.replace(url.origin, '');
};

/**
 * Формирует объект опций для запроса на основании переданной конфигурации.
 * @param {Object} config Конфигурация.
 * @return {Object} Опции.
 */
export const createOptions = ({
  url,
  baseURL,
  method,
  headers,
  httpAgent,
  httpsAgent,
  params,
  paramsSerializer,
  maxRedirects,
  maxContentLength,
}) => {
  const fullURL = createConcatURL(url, baseURL);
  const {
    protocol,
    hostname,
    port,
  } = fullURL;

  const agent = isHttps(protocol) ? httpsAgent : httpAgent;

  const result = {
    path: buildRequestPath(fullURL, params, paramsSerializer),
    method: method.toUpperCase(),
    agents: { http: httpAgent, https: httpsAgent },
    headers,
    agent,
    hostname,
    port: Number(port) || undefined,
  };

  if (maxRedirects) {
    result.maxRedirects = maxRedirects;
  }

  if (maxContentLength && maxContentLength > -1) {
    result.maxBodyLength = maxContentLength;
  }
  return result;
};

/**
 * Возвращает декомпресированный запрос либо исходный запрос, если не было заголовка о компрессии.
 * @param {import('stream').Readable} response Запрос.
 * @return {import('stream').Readable} Обработанный запрос.
 */
export const uncompressResponse = response => {
  const isCompress = [
    'gzip',
    'compress',
    'deflate',
  ].includes(response.headers['content-encoding']);

  return isCompress && response.statusCode !== 204
    ? response.pipe(zlib.createUnzip())
    : response;
};
