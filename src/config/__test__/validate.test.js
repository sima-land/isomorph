import validateConfig, {
  validateProperty,
  validateValue,
  checkValue,
  getValidatorsList,
  RULE_TYPES,
} from '../validate';
import {
  callError,
  defaultValidate,
} from '../helpers';
import isNumber from 'lodash/isNumber';

jest.mock('../helpers', () => {
  const original = jest.requireActual('../helpers');
  return {
    ...original,
    __esModule: true,
    defaultValidate: jest.fn(original.defaultValidate),
    callError: jest.fn(original.callError),
  };
});

jest.mock('lodash/isNumber', () => {
  const original = jest.requireActual('lodash/isNumber');
  return {
    ...original,
    __esModule: true,
    default: jest.fn(original.default),
  };
});

describe('validateConfig()', () => {
  it('should throw error', () => {
    expect(() => validateConfig())
      .toThrowError('Конфигурация приложения должна быть чистым объектом');

    expect(() => validateConfig({ a: 1 }))
      .toThrowError('Конфигурация валидатора должна быть чистым объектом');
  });

  it('should validate each property', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error')
      .mockImplementation(() => jest.fn());

    validateConfig({ a: 1 }, {
      a: { type: RULE_TYPES.warning },
      b: { type: RULE_TYPES.warning },
    });

    expect(consoleErrorSpy).toBeCalledTimes(2);
    expect(consoleErrorSpy)
      .toHaveBeenNthCalledWith(1, 'Ошибка конфигрурации приложения: Поле "a" заполнено некорректно');
    expect(consoleErrorSpy)
      .toHaveBeenNthCalledWith(2, 'Ошибка конфигрурации приложения: Поле "b" заполнено некорректно');
  });

  it('should return config', () => {
    const config = { test: 'test-value' };
    const result = validateConfig(config, {});

    expect(result).toBe(config);
  });
});

describe('validateValue()', () => {
  it('should call an error if a value is not valid', () => {
    const property = 'test';
    const value = 'test-value';
    const validation = jest.fn(() => false);
    const error = jest.fn();

    validateValue(property, value, {
      type: RULE_TYPES.error,
      error,
      validation,
    });

    expect(callError).toBeCalledTimes(1);
    expect(callError).toBeCalledWith({
      property,
      value,
      error,
      validate: validation,
      type: RULE_TYPES.error,
    });
  });

  it('shouldn`t call an error if a value is valid', () => {
    const property = 'test';
    const value = 'test-value';
    const validation = jest.fn(() => true);
    const error = jest.fn();

    validateValue(property, value, {
      type: RULE_TYPES.error,
      error,
      validation,
    });

    expect(callError).toBeCalledTimes(0);
  });
});

describe('validateProperty()', () => {
  it('should call error if config doesn`t contain a property', () => {
    validateProperty({}, 'test', {
      type: RULE_TYPES.warning,
      error: 'Test error',
    });

    expect(callError).toBeCalledTimes(1);
    expect(callError).toBeCalledWith({
      error: 'Test error',
      property: 'test',
      type: RULE_TYPES.warning,
      value: undefined,
    });
  });

  it('should validate value when rules is an object', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error')
      .mockImplementation(() => jest.fn());
    const config = { test: 'test-value' };
    validateProperty(config, 'test', {
      type: RULE_TYPES.warning,
      validation: isNumber,
      // eslint-disable-next-line no-console
      error: (property, value) => console.error(`Ошибка ${property}: ${value}`),
    });

    expect(consoleErrorSpy).toBeCalledTimes(1);
    expect(consoleErrorSpy).toBeCalledWith('Ошибка test: test-value');
  });

  it('should validate value when rules is an array', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error')
      .mockImplementation(() => jest.fn());
    const config = { test: 'test-value' };
    validateProperty(config, 'test', [
      {
        type: RULE_TYPES.warning,
        validation: isNumber,
        // eslint-disable-next-line no-console
        error: (property, value) => console.error(`Ошибка ${property}: ${value}`),
      },
      {
        type: RULE_TYPES.warning,
        validation: isNumber,
        // eslint-disable-next-line no-console
        error: (property, value) => console.error(`Ошибка #2 ${property}: ${value}`),
      },
    ]);

    expect(consoleErrorSpy).toBeCalledTimes(2);
    expect(consoleErrorSpy).toHaveBeenNthCalledWith(1, 'Ошибка test: test-value');
    expect(consoleErrorSpy).toHaveBeenNthCalledWith(2, 'Ошибка #2 test: test-value');
  });
});

describe('checkValue()', () => {
  const value = 'test value';

  it('should validation value by a custom validate function', () => {
    const validate = jest.fn(() => true);
    const result = checkValue(validate, value);

    expect(validate).toBeCalledTimes(1);
    expect(validate).toBeCalledWith(value);
    expect(validate).toReturnWith(true);
    expect(result).toBe(false);
  });

  it('should validation value by the default validate function', () => {
    expect(defaultValidate).toBeCalledTimes(0);
    const result = checkValue(null, value);

    expect(defaultValidate).toBeCalledTimes(1);
    expect(defaultValidate).toBeCalledWith(value);
    expect(defaultValidate).toReturnWith(true);
    expect(result).toBe(false);
  });
});

describe('getValidatorsList()', () => {
  it('should return an array when validation is a function', () => {
    const validation = jest.fn();
    const result = getValidatorsList(validation);

    expect(result).toStrictEqual([{
      validate: validation,
    }]);
  });

  it('should return an array when validation is an object', () => {
    const validation = { validate: jest.fn() };
    const result = getValidatorsList(validation);

    expect(result).toStrictEqual([validation]);
  });

  it('should return an array when validation is an array', () => {
    const validation = [
      { validate: jest.fn() },
      { validate: jest.fn() },
    ];
    const result = getValidatorsList(validation);

    expect(result).toStrictEqual(validation);
  });
});
