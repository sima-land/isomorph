import createComposeMiddleware from '../create-compose-middleware';
import { compose } from 'redux';

describe('createComposeMiddleware', () => {
  it('should return result of compose creator function', () => {
    const devToolsComposeCreator = jest.fn();
    const name = 'Test name';
    const result = createComposeMiddleware({
      devToolsComposeCreator,
      getName: () => name,
      getDevToolsEnabled: () => true,
    });

    expect(devToolsComposeCreator).toBeCalledWith({
      name,
    });
    expect(result).not.toBe(compose);
  });

  it('should return redux compose if "devToolsComposeCreator" is not a function', () => {
    expect(createComposeMiddleware({
      devToolsComposeCreator: 'test',
      getDevToolsEnabled: () => true,
      getName: () => 'test',
    })).toBe(compose);
  });

  it('should return redux compose if "getName" is not a functions', () => {
    expect(createComposeMiddleware({
      devToolsComposeCreator: jest.fn(),
      getDevToolsEnabled: () => true,
      getName: 'test',
    })).toEqual(compose);
  });

  it('should return redux compose if getDevToolsEnabled is not a function', () => {
    expect(createComposeMiddleware({
      devToolsComposeCreator: jest.fn(),
      getDevToolsEnabled: 'test',
      getName: () => 'test',
    })).toBe(compose);
  });

  it('should return redux compose if getDevToolsEnabled return false', () => {
    expect(createComposeMiddleware({
      devToolsComposeCreator: jest.fn(),
      getDevToolsEnabled: () => false,
      getName: () => 'test',
    })).toBe(compose);
  });

  it('should return redux compose if options not passed', () => {
    expect(createComposeMiddleware()).toBe(compose);
  });
});
