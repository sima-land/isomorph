import { call } from 'redux-saga/effects';
import safeRequest from '../safe-request';
import doSafeRequest from '../do-safe-request';

const requestFn = jest.fn();

describe('common function safeRequest', () => {
  it('should wrap call doSafeRequest saga in call effect', () => {
    const options = {
      args: ['test'],
    };
    expect(safeRequest(requestFn, options)).toEqual(call(doSafeRequest, requestFn, options));
  });
});
