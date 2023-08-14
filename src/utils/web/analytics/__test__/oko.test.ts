import { okoPush } from '../oko';

describe('okoPush', () => {
  beforeAll(() => {
    (window as any).oko = {
      checkContext: () => 123,

      push: jest.fn(function (this: any, data) {
        // имитируем реальную работу window.oko.push: в процессе удаляет data.n
        delete data.n;

        // имитируем реальную работу window.oko.push: в процессе вызывает другие методы с this
        this.checkContext();
      }),
    };
  });

  afterAll(() => {
    delete (window as any).oko;
  });

  it('should handle window.oko.push mutates object argument', () => {
    const testData = {
      n: 'test-event',
      prop1: 1,
      prop2: 2,
    };

    expect((window as any).oko.push).toBeCalledTimes(0);

    okoPush(testData);

    expect((window as any).oko.push).toBeCalledTimes(1);
    expect((window as any).oko.push.mock.calls[0][0]).toEqual({
      prop1: 1,
      prop2: 2,
    });
    expect(testData).toEqual({
      n: 'test-event',
      prop1: 1,
      prop2: 2,
    });
  });

  it('should handle window.oko.push absence', () => {
    delete (window as any).oko;

    expect(() => okoPush({ n: 'test-123' })).not.toThrow();
  });
});
