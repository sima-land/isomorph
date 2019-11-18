import { applyMiddleware, createEnhancer, mapServiceOptionsToArgs } from '../create-enhancer';

describe('applyMiddleware', () => {
  it(
    'creates function, which returns pure instance without applying middleware if middleware was not passed.',
    () => {
      const applyFunction = applyMiddleware();
      expect(applyFunction).toBeInstanceOf(Function);
      expect(applyFunction).toHaveLength(1);
      const instance = { use: jest.fn() };
      expect(instance.use).not.toHaveBeenCalled();
      expect(applyFunction(instance)).toBe(instance);
      expect(instance.use).not.toHaveBeenCalled();
    }
  );
  it(
    'creates function, which returns instance with applied middleware if middleware was passed.',
    () => {
      const firstMiddleware = jest.fn();
      const secondMiddleware = jest.fn();
      const applyFunction = applyMiddleware(firstMiddleware, secondMiddleware);
      expect(applyFunction).toBeInstanceOf(Function);
      expect(applyFunction).toHaveLength(1);
      const instance = { use: jest.fn(() => instance) };
      expect(instance.use).not.toHaveBeenCalled();
      expect(applyFunction(instance)).toBe(instance);
      expect(instance.use).toHaveBeenCalledWith(firstMiddleware);
      expect(instance.use).toHaveBeenCalledWith(secondMiddleware);
    }
  );
});

describe('createEnhancer', () => {
  const instance = { use: jest.fn(() => instance) };
  it(
    'creates function, which returns pure instance without applying middleware if constructors was not passed.',
    () => {
      const enhancer = createEnhancer();
      expect(enhancer).toBeInstanceOf(Function);
      expect(enhancer).toHaveLength(1);
      expect(instance.use).not.toHaveBeenCalled();
      expect(enhancer(instance)).toBe(instance);
      expect(instance.use).not.toHaveBeenCalled();
    }
  );
  it('creates function, which create middleware and applies them to axios instance if constructors was passed', () => {
    const middleware = jest.fn();
    const constructor = jest.fn(() => middleware);
    const params = {
      test: 'test',
    };
    const enhancer = createEnhancer([constructor], params);
    expect(constructor).toHaveBeenCalledWith(params);
    expect(enhancer).toBeInstanceOf(Function);
    expect(enhancer).toHaveLength(1);
    expect(instance.use).not.toHaveBeenCalled();
    expect(enhancer(instance)).toBe(instance);
    expect(instance.use).toHaveBeenCalledWith(middleware);
  });
});

describe('mapServiceOptionsToArgs', () => {
  it('creates function arguments array from service options correctly', () => {
    const constructors = [];
    const params = {
      test: 'test',
    };
    expect(mapServiceOptionsToArgs({ constructors, ...params })).toEqual([
      constructors,
      params,
    ]);
  });
});
