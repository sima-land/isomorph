import type { ConventionalFluentInfo, Logger, LogHandler } from '../../../log/types';
import { BridgeServerSide, SsrBridge } from '../../../utils/ssr';
import { ConfigSource, createConfigSource } from '../../../config';
import { createLogger } from '../../../log';
import { createPinoHandler } from '../../../log/handler/pino';
import { createSentryHandler } from '../../../log/handler/sentry';
import { HttpApiHostPool } from '../../isomorphic/utils/http-api-host-pool';
import { KnownToken } from '../../../tokens';
import { Resolve } from '../../../di';
import { KnownHttpApiKey } from '../../isomorphic/types';
import { toMilliseconds } from '../../../utils';
import { PAGE_HANDLER_EVENT_TYPE } from '../../server/constants';
import { getClientIp } from '../utils/get-client-ip';

// Node.js specific packages
import os from 'node:os';
import path from 'node:path';

// Node.js libraries (not isomorphic)
import { config as applyDotenv } from 'dotenv';
import { init, getCurrentHub, Handlers } from '@sentry/node';
import * as PromClient from 'prom-client';
import Express, { Application, ErrorRequestHandler, Handler, Request, Response } from 'express';
import pino from 'pino';
import PinoPretty from 'pino-pretty';

// opentelemetry
import { propagation, ROOT_CONTEXT, trace, type Tracer } from '@opentelemetry/api';
import {
  BasicTracerProvider,
  BatchSpanProcessor,
  SpanExporter,
} from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { JaegerPropagator } from '@opentelemetry/propagator-jaeger';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { getHandlerMetrics, LABEL_NAMES } from '../../server/utils/get-handler-metrics';

/**
 * Провайдер источника конфигурации.
 * @return Источник конфигурации.
 */
export function provideConfigSource(): ConfigSource {
  const envName = process.env.NODE_ENV;

  // подключаем соответствующий среде файл со значениями по умолчанию
  if (envName) {
    applyDotenv({ path: path.resolve(process.cwd(), `./.env.${envName}`) });
  }

  return createConfigSource(process.env);
}

/**
 * Провайдер Logger'а.
 * @param resolve Функция для получения зависимости по токену.
 * @return Logger.
 */
export function provideLogger(resolve: Resolve): Logger {
  const logger = createLogger();

  // @todo возможно надо придумать как не давать вызывать провайдеры внутри провайдеров
  logger.subscribe(providePinoHandler(resolve));
  logger.subscribe(provideSentryHandler(resolve));

  return logger;
}

/**
 * Провайдер обработчика логирования для Sentry.
 * @param resolve Функция для получения зависимости по токену.
 * @return Обработчик.
 */
export function provideSentryHandler(resolve: Resolve): LogHandler {
  const source = resolve(KnownToken.Config.source);

  // экспериментально пробуем не использовать вручную созданный клиент
  init({
    dsn: source.require('SENTRY_DSN'),
    release: source.require('SENTRY_RELEASE'),
    environment: source.require('SENTRY_ENVIRONMENT'),
  });

  // ВАЖНО: передаем функцию чтобы брать текущий hub в момент вызова метода logger'а
  // это нужно чтобы хлебные крошки в ошибках Sentry группировались по запросам
  return createSentryHandler(getCurrentHub);
}

/**
 * Провайдер обработчика логирования для Pino.
 * @param resolve Функция для получения зависимости по токену.
 * @return Обработчик.
 */
export function providePinoHandler(resolve: Resolve): LogHandler {
  const config = resolve(KnownToken.Config.base);

  const pinoLogger = pino(
    config.env === 'production'
      ? {
          formatters: {
            // ВАЖНО: для Fluent необходимо наличие поля level: string
            level: label => ({ level: label }),
          },
        }
      : PinoPretty({
          colorize: true,
          translateTime: 'yyyy-mm-dd HH:MM:ss.l o',
        }),
  );

  return createPinoHandler(pinoLogger);
}

/**
 * Провайдер объекта Tracer.
 * @param resolve Функция для получения зависимости по токену.
 * @return Tracer.
 */
export function provideTracer(resolve: Resolve): Tracer {
  const config = resolve(KnownToken.Config.base);
  const provider = resolve(KnownToken.Tracing.tracerProvider);

  return provider.getTracer(config.appName, config.appVersion);
}

/**
 * Провайдер объекта SpanExporter.
 * @param resolve Функция для получения зависимости по токену.
 * @return SpanExporter.
 */
export function provideSpanExporter(resolve: Resolve): SpanExporter {
  const source = resolve(KnownToken.Config.source);

  return new OTLPTraceExporter({
    url: source.require('JAEGER_AGENT_URL'),
  });
}

/**
 * Провайдер объекта BasicTracerProvider.
 * @param resolve Функция для получения зависимости по токену.
 * @return BasicTracerProvider.
 */
export function provideTracerProvider(resolve: Resolve): BasicTracerProvider {
  const exporter = resolve(KnownToken.Tracing.spanExporter);
  const resource = resolve(KnownToken.Tracing.tracerProviderResource);

  const provider = new NodeTracerProvider({ resource });

  provider.addSpanProcessor(new BatchSpanProcessor(exporter));
  provider.register({ propagator: new JaegerPropagator() });

  return provider;
}

/**
 * Провайдер объекта Resource.
 * @param resolve Функция для получения зависимости по токену.
 * @return Resource.
 */
export function provideTracerProviderResource(resolve: Resolve): Resource {
  const config = resolve(KnownToken.Config.base);

  return new Resource({
    [SemanticResourceAttributes.HOST_NAME]: os.hostname(),
    [SemanticResourceAttributes.SERVICE_NAME]: config.appName,
    [SemanticResourceAttributes.SERVICE_VERSION]: config.appVersion,
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: config.env,
  });
}

/**
 * Провайдер фабрики http-серверов.
 * @return Фабрика.
 */
export function provideExpressFactory() {
  return Express;
}

/**
 * Провайдер промежуточного слоя учета входящих http-запросов.
 * @return Промежуточный слой.
 */
export function provideExpressRequestMiddleware(): Handler {
  return Handlers.requestHandler();
}

/**
 * Провайдер промежуточного слоя логирования входящих http-запросов.
 * @param resolve Функция для получения зависимости по токену.
 * @return Промежуточный слой.
 */
export function provideExpressLogMiddleware(resolve: Resolve): Handler {
  const config = resolve(KnownToken.Config.base);
  const logger = resolve(KnownToken.logger);

  return (req, res, next) => {
    const start = process.hrtime.bigint();
    const remoteIp = getClientIp(req) ?? '';

    const startMsg: Omit<ConventionalFluentInfo, 'latency' | 'status'> & { type: string } = {
      type: 'http.request[incoming]',
      version: config.appVersion,
      route: req.originalUrl,
      method: req.method,
      remote_ip: remoteIp,
    };

    logger.info(startMsg);

    res.once('finish', () => {
      const finish = process.hrtime.bigint();

      const finishMsg: ConventionalFluentInfo & { type: string } = {
        type: 'http.response[outgoing]',
        version: config.appVersion,
        route: req.originalUrl,
        method: req.method,
        status: res.statusCode,
        remote_ip: remoteIp,
        latency: toMilliseconds(finish - start),
      };

      logger.info(finishMsg);
    });

    next();
  };
}

/**
 * Провайдер промежуточного слоя сбора метрик входящих http-запросов.
 * @param resolve Функция для получения зависимости по токену.
 * @return Промежуточный слой.
 */
export function provideExpressMetricsMiddleware(resolve: Resolve): Handler {
  const config = resolve(KnownToken.Config.base);
  const { requestCount, renderDuration, responseDuration } = getHandlerMetrics();

  /**
   * Функция формирования labels.
   * @param req Request.
   * @param res Response.
   * @return Labels.
   */
  const getLabels = (
    req: Request,
    res: Response,
  ): Record<(typeof LABEL_NAMES.httpResponse)[number], string | number> => ({
    version: config.appVersion,
    route: req.baseUrl + req.path,
    code: res.statusCode,
    method: req.method,
  });

  /** @inheritdoc */
  const getRenderLabels = (request: Request) =>
    ({
      version: config.appVersion,
      method: request.method,
      route: request.url,
    }) satisfies Record<(typeof LABEL_NAMES.pageRender)[number], string | number>;

  return (req, res, next) => {
    const responseStart = process.hrtime.bigint();

    requestCount.inc(getLabels(req, res), 1);

    res.once(PAGE_HANDLER_EVENT_TYPE.renderStart, () => {
      const renderStart = process.hrtime.bigint();

      res.once(PAGE_HANDLER_EVENT_TYPE.renderFinish, () => {
        const renderFinish = process.hrtime.bigint();

        renderDuration.observe(getRenderLabels(req), toMilliseconds(renderFinish - renderStart));
      });
    });

    res.once('finish', () => {
      const responseFinish = process.hrtime.bigint();

      responseDuration.observe(getLabels(req, res), toMilliseconds(responseFinish - responseStart));
    });

    next();
  };
}

/**
 * Провайдер промежуточного слоя трассировки входящих http-запросов.
 * @param resolve Функция для получения зависимости по токену.
 * @return Промежуточный слой.
 */
export function provideExpressTracingMiddleware(resolve: Resolve): Handler {
  const tracer = resolve(KnownToken.Tracing.tracer);

  /**
   * Возвращает набор стандартных атрибутов для спана.
   * @param req Входящий http-запрос.
   * @return Атрибуты.
   */
  const getConventionalRequestAttrs = (req: Request): Record<string, string | undefined> => {
    const result: Record<string, string | undefined> = {
      'request.path': req.originalUrl,
    };

    for (const headerName in req.headers) {
      if (headerName.toLowerCase().startsWith('simaland-')) {
        result[headerName] = req.header(headerName);
      }
    }

    return result;
  };

  return (req, res, next) => {
    const externalContext = propagation.extract(ROOT_CONTEXT, req.headers);
    const rootSpan = tracer.startSpan('response', undefined, externalContext);

    rootSpan.setAttributes(getConventionalRequestAttrs(req));

    const rootContext = trace.setSpan(externalContext, rootSpan);

    res.locals.tracing = {
      rootSpan,
      rootContext,
      renderSpan: null,
    };

    res.once(PAGE_HANDLER_EVENT_TYPE.renderStart, () => {
      res.locals.tracing.renderSpan = tracer.startSpan('render', undefined, rootContext);

      res.once(PAGE_HANDLER_EVENT_TYPE.renderFinish, () => {
        res.locals.tracing.renderSpan.end();
      });
    });

    res.once('finish', () => {
      rootSpan.end();
    });

    next();
  };
}

/**
 * Провайдер промежуточного слоя обработки ошибок в рамках ответ на http-запросы.
 * @return Промежуточный слой.
 */
export function provideExpressErrorMiddleware(): ErrorRequestHandler {
  return Handlers.errorHandler();
}

/**
 * Провайдер серверной части "моста" для передачи данных между сервером и клиентом.
 * @param resolve Функция для получения зависимости по токену.
 * @return Серверная часть "моста".
 */
export function provideSsrBridgeServerSide(resolve: Resolve): BridgeServerSide {
  const config = resolve(KnownToken.Config.base);

  return SsrBridge.prepare(config.appName);
}

/**
 * Провайдер известных http-хостов.
 * @param resolve Функция для получения зависимости по токену.
 * @return Пул известных http-хостов.
 */
export function provideKnownHttpApiHosts(resolve: Resolve): HttpApiHostPool<KnownHttpApiKey> {
  const source = resolve(KnownToken.Config.source);

  return new HttpApiHostPool(
    {
      ilium: 'API_URL_ILIUM',
      simaV3: 'API_URL_SIMALAND_V3',
      simaV4: 'API_URL_SIMALAND_V4',
      simaV6: 'API_URL_SIMALAND_V6',
      chponkiV2: 'API_URL_CHPONKI_V2',
    },
    source,
  );
}

/**
 * Провайдер express-приложения метрик.
 * @return Пул известных http-хостов.
 */
export function provideMetricsHttpApp(): Application {
  PromClient.collectDefaultMetrics();

  const app = Express();

  app.get('/', async function (req, res) {
    const metrics = await PromClient.register.metrics();

    res.setHeader('Content-Type', PromClient.register.contentType);
    res.send(metrics);
  });

  return app;
}
