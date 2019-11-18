import { createInstance, mapServiceOptionsToArgs } from '../create-instance';
import { create } from 'axios';
import { wrapInstance } from 'middleware-axios';

jest.mock('axios', () => {
  const original = jest.requireActual('axios');
  return {
    ...original,
    create: jest.fn(original.create),
  };
});

jest.mock('middleware-axios', () => {
  const original = jest.requireActual('middleware-axios');
  return {
    ...original,
    wrapInstance: jest.fn(original.wrapInstance),
  };
});

describe('createInstance', () => {
  it('creates wrapped axios instance without enhancer correctly', () => {
    const config = {
      baseUrl: 'http://test.ru/',
    };
    const instance = createInstance(config);
    expect(create).toHaveBeenCalledWith(config);
    expect(wrapInstance).toHaveBeenCalledWith(create.mock.results[0].value);
    expect(instance).toEqual(wrapInstance.mock.results[0].value);
  });
  it('creates wrapped axios instance with enhancer correctly', () => {
    const config = {
      baseUrl: 'http://test.ru/',
    };
    const enhancer = jest.fn(instance => instance);
    const instance = createInstance(config, enhancer);
    expect(enhancer).toHaveBeenCalledWith(instance);
  });
});

describe('mapServiceOptionsToArgs', () => {
  it('creates function arguments array from service options correctly', () => {
    const config = {
      baseUrl: 'http://test.ru/',
    };
    const enhancer = jest.fn(instance => instance);
    expect(mapServiceOptionsToArgs({ config, enhancer })).toEqual([
      config,
      enhancer,
    ]);
  });
});
