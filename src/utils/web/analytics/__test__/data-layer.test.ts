import { dataLayerPush } from '../data-layer';

describe('dataLayerPush', () => {
  beforeAll(() => {
    (window as any).dataLayer = {
      checkContext: () => 123,

      push: jest.fn(function (this: any, data) {
        // имитируем реальную работу window.dataLayer.push: в процессе удаляет data.n
        delete data.n;

        // имитируем реальную работу window.dataLayer.push: в процессе вызывает другие методы с this
        this.checkContext();
      }),
    };
  });

  afterAll(() => {
    delete (window as any).dataLayer;
  });

  it('should handle window.dataLayer.push mutates object argument', () => {
    const testData = {
      n: 'test-event',
      prop1: 1,
      prop2: 2,
    };

    expect((window as any).dataLayer.push).toHaveBeenCalledTimes(0);

    dataLayerPush(testData);

    expect((window as any).dataLayer.push).toHaveBeenCalledTimes(1);
    expect((window as any).dataLayer.push.mock.calls[0][0]).toEqual({
      prop1: 1,
      prop2: 2,
    });
    expect(testData).toEqual({
      n: 'test-event',
      prop1: 1,
      prop2: 2,
    });
  });

  it('should handle window.dataLayer.push absence', () => {
    delete (window as any).dataLayer;

    expect(() => dataLayerPush({ n: 'test-123' })).not.toThrow();
  });
});
