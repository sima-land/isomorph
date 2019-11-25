import { getTemplate, validateTemplate, jsonStringifyReplacer, prepareRenderFunction } from '..';
import wrapInMeasureEvent from '../../utils/wrap-in-measure-event';
import EventEmitter from 'events';

jest.mock('../../utils/wrap-in-measure-event', () => {
  const original = jest.requireActual('../../utils/wrap-in-measure-event');
  return {
    ...original,
    __esModule: true,
    default: jest.fn(original.default),
  };
});

describe('function prepareRenderFunction', () => {
  it('wraps the render function into sending the events "render:start" and "render:finish"', async () => {
    const data = 'test data';
    const render = jest.fn(test => test);
    const response = new EventEmitter();
    const startEvent = 'render:start';
    const endEvent = 'render:finish';
    jest.spyOn(response, 'emit');
    expect(wrapInMeasureEvent).not.toHaveBeenCalled();
    const wrappedFunction = prepareRenderFunction({ render, response });
    expect(wrapInMeasureEvent).toHaveBeenCalledWith({ fn: render, startEvent, endEvent, emitter: response });
    expect(response.emit).not.toHaveBeenCalled();
    const result = await wrappedFunction(data);
    expect(render).toHaveBeenCalledWith(data);
    expect(result).toEqual(data);
    expect(response.emit).toHaveBeenCalledWith('render:start');
    expect(response.emit).toHaveBeenCalledWith('render:finish');
  });
});

describe('getTemplate()', () => {
  const templates = {
    development: {
      checker: config => Boolean(config.isDevelopment),
      template: () => '<div>Development</div>',
    },
  };
  it('should return pattern if correct config have been passed', () => {
    const config = {
      isDevelopment: true,
    };
    expect(getTemplate({ templates, config })).toEqual(templates.development.template);
  });
  it('should return undefined if incorrect config have been passed', () => {
    const config = {
      isNotConfig: true,
    };
    expect(getTemplate({ templates, config })).toBeUndefined();
  });
  it('should return undefined if no settings were passed', () => {
    expect(getTemplate()).toBeUndefined();
  });
});

describe('validateTemplate()', () => {
  const templates = {
    development: {
      checker: config => Boolean(config.isDevelopment),
      template: () => 'Development',
    },
    production: {
      checker: config => Boolean(config.isProduction),
      template: 'I am not Function',
    },
  };
  const toJsonObject = '\n{\n'
    + '  "checker": "[object Function]",\n'
    + '  "template": "I am not Function"\n'
    + '}';
  it('should return error and incorrect pattern', () => {
    const objTest = templates.production;
    expect(() => validateTemplate(objTest)).toThrowError(
      `Template object must contain properties "checker" and "template" that must be a functions.${toJsonObject}`
    );
  });
  it('should return error', () => {
    expect(() => validateTemplate()).toThrowError(
      'Template object must contain properties "checker" and "template" that must be a functions.'
    );
  });
  it('should return correct pattern', () => {
    const objTest = templates.development;
    expect(validateTemplate(objTest)).toEqual(objTest);
  });
});

describe('jsonStringifyReplacer()', () => {
  const key = 'I am key object';
  it('should return string if the value object string', () => {
    const valueString = 'string';
    expect(jsonStringifyReplacer(key, valueString)).toEqual(valueString);
  });
  it('should return string if the value object function', () => {
    const valueFunction = jest.fn();
    const valueString = '[object Function]';
    expect(jsonStringifyReplacer(key, valueFunction)).toEqual(valueString);
  });
});
