import type { Shared, OriginalShared } from './types';
import { mergeModules } from './utils';

type SharedArray = Extract<OriginalShared, Array<unknown>>;

/**
 * Перечень общих для всех сервисов зависимостей.
 */
const VENDORS_LIBRARIES: SharedArray = [
  {
    react: {
      singleton: true,
    },
    'react-dom': {
      singleton: true,
    },
  },

  /* Инжектится транспайлером в [jt]sx для преобразования JSX */
  'react/jsx-runtime',
  'react-redux',
  '@reduxjs/toolkit',
  'redux-saga',

  /* Шарим модули, импортируемые из поддиректорий, например `/effects` */
  'redux-saga/',
  'classnames',
  /* Шарим модули, импортируемые из поддиректорий, например `/bind` */
  'classnames/',
  'axios',
  '@olime/cq-ch',
  '@sentry/browser',
];

/**
 * Возвращает базовый набор общих модулей.
 * @return Базовые модули.
 */
export function defineSharedConfig(): SharedArray {
  return VENDORS_LIBRARIES;
}

/**
 * Позволяет добавить к базовому набору дополнительные модули.
 * Модули, переопределяющие базовые, будут проигнорированы.
 * @param modules Добавляемы модули.
 * @return Дополненная конфигурация.
 */
function expandModules(modules: OriginalShared): OriginalShared {
  return mergeModules(modules, defineSharedConfig());
}

/**
 * Позволяет добавить к базовому набору дополнительные модули,
 * с возможностью переопределения/исключения базовых модулей.
 * Для исключения модуля необходимо присвоить ему значение false.
 * @example defineSharedConfig.override({ react: false, 'react-dom': { requiredVersion: '^x.x.x' } })
 * @param modules Добавляемы модули.
 * @return Дополненная конфигурация.
 */
function overrideModules(modules: Shared): OriginalShared {
  return mergeModules(defineSharedConfig(), modules);
}

defineSharedConfig.expand = expandModules;
defineSharedConfig.override = overrideModules;
