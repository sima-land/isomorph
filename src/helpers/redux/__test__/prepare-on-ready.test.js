import prepareOnReady from '../prepare-on-ready';

jest.useFakeTimers('modern');

describe('function prepareOnReady', () => {
  const unsubscribe = jest.fn();

  // временно, https://github.com/facebook/jest/issues/11500
  beforeAll(() => {
    jest.spyOn(global, 'clearTimeout');
  });
  afterAll(() => {
    global.clearTimeout.mockRestore();
  });

  it('creates handler which unsubscribe, clears timeout and invoke specified callback', () => {
    const spy = jest.fn();

    const handler = prepareOnReady({}, unsubscribe, spy);

    expect(unsubscribe).not.toHaveBeenCalled();
    expect(spy).not.toHaveBeenCalled();
    expect(clearTimeout).not.toHaveBeenCalled();

    handler(123456);
    expect(unsubscribe).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith({});
    expect(clearTimeout).toHaveBeenCalledWith(123456);
  });

  it('creates handler which does not invoke clearTimeout '
    + 'if identifier of timeout has not been passed on calling', () => {
    const handler = prepareOnReady({}, unsubscribe);

    expect(clearTimeout).not.toHaveBeenCalled();
    handler(123456);
    expect(clearTimeout).toHaveBeenCalledWith(123456);
  });
});
