import {
  isStream,
  isEventEmitter,
  prepareDataBuffer,
  createOptions,
  createTransport,
  uncompressResponse,
  enhanceError,
  createError,
  settle,
} from './helpers';

import { REQUEST_STAGES } from './constants';

/**
 * Адаптер для Axios, создающий события на основных этапах запроса к API.
 * За образец использован дефолтный адаптер 'axios/lib/adapters/http.js',
 * но без поддержки proxy, socketPath и cancelToken за ненадобностью.
 * Только для NodeJS, на клиенте не использовать.
 * @param {Object} config Конфигурация интсанса Axios.
 * @return {Promise} Разрешится после запроса к API.
 */
const serverAdapter = config => new Promise((resolve, reject) => {
  const {
    headers,
    data: pureData,
    timeout,
    responseType,
    maxContentLength,
    responseEncoding,
    emitter,
  } = config;

  const needEmit = isEventEmitter(emitter);

  // Регистрируем обработчик начала запроса.
  needEmit && emitter.emit(REQUEST_STAGES.start);

  // Подготовка данных запроса.
  let data;

  if (pureData && !isStream(pureData)) {
    data = prepareDataBuffer(pureData);
    if (data) {
      headers['Content-Length'] = data.length;
    } else {
      reject(createError(
        'Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream',
        config
      ));
    }
  } else {
    data = pureData;
  }

  const options = createOptions({ ...config, headers });
  const transport = createTransport(config);

  // Создаем запрос и коллбэк, обрабатывающий ответ.
  const req = transport.request(options, res => {
    // Регистрируем обработчик получения ответа.
    res.once('readable', () => needEmit && emitter.emit(REQUEST_STAGES.firstByteReceived));

    const stream = uncompressResponse(res);

    if (stream !== res) {
      delete res.headers['content-encoding'];
    }

    const response = {
      status: res.statusCode,
      statusText: res.statusMessage,
      headers: res.headers,
      config,
      request: res.req,
    };

    const resBuffer = [];

    /**
     * Обработчик получения порции данных.
     * @param {Buffer} chunk Порция данных.
     */
    const chunksHandler = chunk => {
      resBuffer.push(chunk);
      if (
        maxContentLength > -1
          && Buffer.concat(resBuffer).length > maxContentLength
      ) {
        stream.destroy();
        reject(createError(`maxContentLength size of ${maxContentLength} exceeded`, config, null, res.req));
      }
    };

    /**
     * Обработчик завершения получения данных.
     */
    const finishHandler = () => {
      const concatBuffer = Buffer.concat(resBuffer);
      response.data = responseType === 'arraybuffer'
        ? concatBuffer
        : concatBuffer.toString(responseEncoding);

      settle(resolve, reject, response);

      // Регистрируем обработчик завершения запроса.
      needEmit && emitter.emit(REQUEST_STAGES.end);
    };
    if (responseType === 'stream') {
      response.data = stream;
      settle(resolve, reject, response);
    } else {
      stream
        .on('data', chunksHandler)
        .on('error', err => !req.aborted && reject(enhanceError(err, config, null, res.req)))
        .on('end', finishHandler);
    }
  });

  // Регистрируем обработчики событий сокета.
  if (needEmit) {
    req.on('socket', socket => {
      socket
        .on('lookup', () => emitter.emit(REQUEST_STAGES.dnsLookupFinish))
        .on('connect', () => emitter.emit(REQUEST_STAGES.tcpConnectionConnect))
        .on('secureConnect', () => emitter.emit(REQUEST_STAGES.tlsHandshakeFinish));
    });
  }

  req.on('error', err => !req.aborted && reject(enhanceError(err, config, null, req)));

  if (timeout) {
    req.setTimeout(timeout, () => {
      req.abort();
      reject(createError(`timeout of ${config.timeout} ms exceeded`, config, 'ECONNABORTED', req));
    });
  }

  // Отправка данных запроса.
  if (isStream(data)) {
    data
      .on('error', err => reject(enhanceError(err, config, null, req)))
      .pipe(req);
  } else {
    req.end(data);
  }
});

export default serverAdapter;
