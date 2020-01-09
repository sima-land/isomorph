import {
  defaultValidate,
  getDefaultError,
  throwError,
  getStringError,
  consoleError,
  callError,
} from '../helpers';
import { RULE_TYPES } from '../validate';

describe('defaultValidate()', () => {
  it('should return true', () => {
    expect(defaultValidate('test')).toBe(true);
  });

  it('should return false', () => {
    expect(defaultValidate('')).toBe(false);
    expect(defaultValidate(1)).toBe(false);
    expect(defaultValidate({})).toBe(false);
    expect(defaultValidate([])).toBe(false);
    expect(defaultValidate(null)).toBe(false);
    expect(defaultValidate(undefined)).toBe(false);
    expect(defaultValidate(true)).toBe(false);
    expect(defaultValidate(jest.fn())).toBe(false);
  });
});

describe('getDefaultError()', () => {
  it('should return error text', () => {
    expect(getDefaultError('testField'))
      .toBe('Ошибка конфигрурации приложения: Поле "testField" заполнено некорректно');
  });
});

describe('throwError()', () => {
  it('should throw error', () => {
    expect(() => throwError('Test error'))
      .toThrowError('Test error');
  });
});

describe('getStringError()', () => {
  it('should return error text', () => {
    expect(getStringError('testField', 'Заполнено некорректно'))
      .toBe('Ошибка конфигурации. Поле "testField": Заполнено некорректно');
  });
});

describe('consoleError()', () => {
  it('should console error', () => {
    const spy = jest.spyOn(console, 'error')
      .mockImplementation(() => jest.fn());
    consoleError('Test error');

    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith('Test error');
  });
});

describe('callError()', () => {
  const property = 'test';
  const value = 'some value';
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error')
      .mockImplementation(() => jest.fn());
  });

  it('should call error if the "error" argument is function', () => {
    const error = jest.fn();
    callError({ property, value, error });

    expect(error).toBeCalledTimes(1);
    expect(error).toBeCalledWith(property, value);
  });

  it('should call error if error is string and type is error', () => {
    const error = 'Test error';

    expect(() => callError({
      property,
      value,
      error,
      type: RULE_TYPES.error,
    })).toThrowError('Test error');
  });

  it('should call error if error is not defined and type is error', () => {
    expect(() => callError({
      property,
      value,
      type: RULE_TYPES.error,
    })).toThrowError('Ошибка конфигрурации приложения: Поле "test" заполнено некорректно');
  });

  it('should call error if error is string and type is warning', () => {
    const error = 'Test error';

    callError({
      property,
      value,
      error,
      type: RULE_TYPES.warning,
    });

    expect(consoleErrorSpy).toBeCalledTimes(1);
    expect(consoleErrorSpy).toBeCalledWith('Ошибка конфигурации. Поле "test": Test error');
  });

  it('should call error if error is not defined and type is warning', () => {
    callError({
      property,
      value,
      type: RULE_TYPES.warning,
    });

    expect(consoleErrorSpy).toBeCalledTimes(1);
    expect(consoleErrorSpy).toBeCalledWith('Ошибка конфигрурации приложения: Поле "test" заполнено некорректно');
  });
});
