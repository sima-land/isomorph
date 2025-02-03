---
sidebar_position: 4
---

# Телеметрия

Для сборки телеметрии используется инструментарий [**OpenTelemetry**](https://opentelemetry.io/).

## Затрагиваемые пресеты

- `node` — формирование начальных данных (Resource, rootSpan) и транспорта (Exporter);
- `node-handler` — отправка данных при обращении к точкам входа,
  генерации вёрстки, запросов к API средствами Axios/fetch (span).

## Настройка Exporter

|   Переменная окружения   | Описание                                                                              |
| :----------------------: | ------------------------------------------------------------------------------------- |
| `OTEL_EXPORTER_OTLP_URL` | URL куда будут высылаться данные телеметрии вида `http://<collector-hostname>:<port>` |

> Для расширенной настройки передатчика данных см. [`@opentelemetry/exporter-trace-otlp-grpc`](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-grpc)

## Объявление и обогащение данных ресурса (`Resource`)

|            Переменная окружения             | Описание                                    |
| :-----------------------------------------: | ------------------------------------------- |
|      `OTEL_RESOURCE_ATTR_SERVICE_NAME`      | Название сервиса (`service-name`)           |
|    `OTEL_RESOURCE_ATTR_SERVICE_VERSION`     | Версия сервиса (`1.0.0`)                    |
|       `OTEL_RESOURCE_ATTR_HOST_NAME`        | Название хоста (`localhost`)                |
| `OTEL_RESOURCE_ATTR_DEPLOYMENT_ENVIRONMENT` | Тип окружения (`production \| development`) |

Также есть возможность дополнить данные через переменные окружения с префиксом `OTEL_RESOURCE_${CONVENTIONAL_NAME}`.

Пример: `OTEL_RESOURCE_ATTR_K8S_CONTAINER_NAME=container` будет преобразован в `{'k8s.container.name':'container'}`.

> Для формирования ключей используются названия констант из [@opentelemetry/semantic-conventions](https://github.com/open-telemetry/opentelemetry-js/blob/v1.28.0/semantic-conventions/src/experimental_attributes.ts).

> **Важно:** Аттрибуты могут иметь различия в зависимости от версии пакета `@opentelemetry/semantic-conventions`.
