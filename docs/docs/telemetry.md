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

|     Переменная окружения     | Описание                                                                       |  Значение по-умолчанию  |
| :--------------------------: | ------------------------------------------------------------------------------ | :---------------------: |
|   `OTEL_EXPORTER_OTLP_URL`   | URL коллектора телеметрии.                                                     | `http://localhost:4317` |
|  `OTEL_EXPORTER_OTLP_PORT`   | Порт коллектора телеметрии. Переписывает значение из `OTEL_EXPORTER_OTLP_URL`. |            —            |
| `OTEL_EXPORTER_OTLP_HEADERS` | Заголовки для транспорта в формате строки JSON.                                |            —            |

**Пример:**

```
OTEL_EXPORTER_OTLP_URL=http://localhost:4317
OTEL_EXPORTER_OTLP_HEADERS='{"Authorization":"Bearer <random-token>","X-GRPC-Service":"otel-collector"}'
```

> Как можно заметить в значении указывается протокол передачи — это намеренно так как выгрузка возможна в Unix domain socket (`sock://`).

> Для расширенной настройки передатчика данных см. документацию пакета [`@opentelemetry/exporter-trace-otlp-grpc`](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-grpc)

## Объявление и обогащение данных ресурса (`Resource`)

Основные данные ресурса предзаполнены и не требуют декларирования.

|           Аттрибут            | Описание                                    |          Значение по-умолчанию          |
| :---------------------------: | ------------------------------------------- | :-------------------------------------: |
|        `service.name`         | Название сервиса (`service-name`)           |  `KnownTokens.Config.base -> appName`   |
|       `service.version`       | Версия сервиса (`1.0.0`)                    | `KnownTokens.Config.base -> appVersion` |
| `deployment.environment.name` | Тип окружения (`production \| development`) |    `KnownTokens.Config.base -> env`     |

> Также есть возможность дополнить или переписать данные через переменную окружения `OTEL_RESOURCE_ATTRIBUTES`. Подробнее — [документация OTEL](https://opentelemetry.io/docs/languages/js/resources/#process--environment-resource-detection).
