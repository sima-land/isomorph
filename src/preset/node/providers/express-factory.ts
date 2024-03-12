import express from 'express';

/**
 * Провайдер фабрики http-серверов.
 * @return Фабрика.
 */
export function provideExpressFactory() {
  return express;
}
