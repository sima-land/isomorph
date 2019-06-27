import { getTemplate, validateTemplate, jsonStringifyReplacer } from '../render';

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
  const objTest = templates.production;
  const toJsonObject = '\n{\n'
    + '  "checker": "[object Function]",\n'
    + '  "template": "I am not Function"\n'
    + '}';
  it('should return error and incorrect pattern', () => {
    expect(() => validateTemplate(objTest)).toThrowError(
      `Template object must contain properties "checker" and "template" that must be a functions.${toJsonObject}`);
  });
  it('should return error', () => {
    expect(() => validateTemplate()).toThrowError(
      'Template object must contain properties "checker" and "template" that must be a functions.');
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
