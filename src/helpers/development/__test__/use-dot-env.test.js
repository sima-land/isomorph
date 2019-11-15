import useDotEnv from '../use-dot-env';
import dotEnv from 'dotenv';

jest.mock('dotenv', () => {
  const original = jest.requireActual('dotenv');
  original.config = jest.fn(original.config);
  return original;
});

describe('useDotEnv', () => {
  it(
    'uses dotenv to set environment variables if environment argument value is in allowed',
    () => {
      expect(dotEnv.config).not.toHaveBeenCalled();
      useDotEnv('test');
      expect(dotEnv.config).toHaveBeenCalled();
    }
  );
  it(
    'does not use dotenv to set environment variables if environment argument value is not in allowed',
    () => {
      expect(dotEnv.config).not.toHaveBeenCalled();
      useDotEnv('isnotinallowed');
      expect(dotEnv.config).not.toHaveBeenCalled();
    }
  );
});
