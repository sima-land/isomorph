import { checkOkoExists, sendAnalytics } from '../analytics';
import { call } from 'redux-saga/effects';
import isObject from 'lodash/isObject';

const windowSpy = jest.spyOn(global, 'window', 'get')
  .mockImplementation(() => undefined);

describe('checkOkoExists()', () => {
  it('should return false when windows is undefined', () => {
    expect(checkOkoExists()).toBe(false);
  });

  it('should return false when oko doesn`t exist', () => {
    windowSpy.mockRestore();
    window.oko = {};
    expect(checkOkoExists()).toBe(false);
  });

  it('should return true when oko are exists', () => {
    windowSpy.mockRestore();
    window.oko = { push: jest.fn() };
    expect(checkOkoExists()).toBe(true);
  });
});

describe('sendAnalytics()', () => {
  windowSpy.mockRestore();

  it('should send analytics', () => {
    const data = { meta: { n: 'custom' } };
    window.oko = { push: jest.fn() };
    const gen = sendAnalytics(data);

    expect(gen.next().value).toEqual(call(checkOkoExists));
    expect(gen.next(true).value).toEqual(call(isObject, data.meta));
    expect(gen.next(true).value).toEqual(call([window.oko, 'push'], data.meta));
    expect(gen.next().done).toBe(true);
  });

  it('shouldn`t send analytics when window has no oko', () => {
    const data = { meta: { n: 'custom' } };
    window.oko = {};
    const gen = sendAnalytics(data);

    expect(gen.next().value).toEqual(call(checkOkoExists));
    expect(gen.next(false).value).toEqual(call(isObject, data.meta));
    expect(gen.next(true).done).toBe(true);
  });

  it('shouldn`t send analytics when meta is not an object', () => {
    const data = { meta: null };
    window.oko = { push: jest.fn() };
    const gen = sendAnalytics(data);

    expect(gen.next().value).toEqual(call(checkOkoExists));
    expect(gen.next(true).value).toEqual(call(isObject, data.meta));
    expect(gen.next(false).done).toBe(true);
  });
});
