import { call } from 'redux-saga/effects';
import doSafeRequest from './do-safe-request';

/**
 * Обёрнутая в эффект call сага doSafeRequest.
 * @param {Array} args Аргументы для вызова саги.
 * @return {import('@redux-saga/core/effects').CallEffect} Эффект.
 */
const safeRequest = (...args) => call(doSafeRequest, ...args);

export default safeRequest;
