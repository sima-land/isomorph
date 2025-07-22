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

Конфигурация инструмента выгрузки опциональна.

|         Переменная окружения         | Описание                                        |  Значение по-умолчанию  |
| :----------------------------------: | ----------------------------------------------- | :---------------------: |
|    `OTEL_EXPORTER_OTLP_ENDPOINT`     | Адрес сборщика данных.                          | `http://localhost:4317` |
|                                      | <center>**ИЛИ**</center>                        |                         |
|    `OTEL_EXPORTER_OTLP_PROTOCOL`     | Протокол сборщика данных.                       |            —            |
|    `OTEL_EXPORTER_OTLP_HOSTNAME`     | Хост сборщика данных.                           |            —            |
|      `OTEL_EXPORTER_OTLP_PORT`       | Порт сборщика данных.                           |            —            |
|                                      |                                                 |                         |
| `OTEL_EXPORTER_OTLP_REQUEST_HEADERS` | Заголовки для транспорта в формате строки JSON. |            —            |

**Пример:**

- С использованием `OTEL_EXPORTER_OTLP_ENDPOINT`:

```
OTEL_EXPORTER_OTLP_ENDPOINT=collector.local:4317
OTEL_EXPORTER_OTLP_REQUEST_HEADERS='{"Authorization":"Bearer <random-token>","X-GRPC-Service":"otel-collector"}'
```

- При указании URL по-частям:

```
OTEL_EXPORTER_OTLP_PROTOCOL=http
OTEL_EXPORTER_OTLP_HOSTNAME=collector
OTEL_EXPORTER_OTLP_PORT=4317
OTEL_EXPORTER_OTLP_REQUEST_HEADERS='{"Authorization":"Bearer <random-token>","X-GRPC-Service":"otel-collector"}'
```

> При указании URL по-частям переменная `OTEL_EXPORTER_OTLP_ENDPOINT` будет проигнорирована.

> При упущении протокола в `OTEL_EXPORTER_OTLP_ENDPOINT` по-умолчанию будет применён `https://`.

> Для расширенной настройки передатчика данных см. документацию пакета [`@opentelemetry/exporter-trace-otlp-grpc`](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-grpc)

## Объявление и обогащение данных ресурса (`Resource`)

Основные данные ресурса предзаполнены и не требуют декларирования.

|           Аттрибут            | Описание                                    |          Значение по-умолчанию          |
| :---------------------------: | ------------------------------------------- | :-------------------------------------: |
|        `service.name`         | Название сервиса (`service-name`)           |  `KnownTokens.Config.base -> appName`   |
|       `service.version`       | Версия сервиса (`1.0.0`)                    | `KnownTokens.Config.base -> appVersion` |
| `deployment.environment.name` | Тип окружения (`production \| development`) |    `KnownTokens.Config.base -> env`     |

> Также есть возможность дополнить или переписать данные через переменную окружения `OTEL_RESOURCE_ATTRIBUTES`. Подробнее — [документация OTEL](https://opentelemetry.io/docs/languages/js/resources/#process--environment-resource-detection).
