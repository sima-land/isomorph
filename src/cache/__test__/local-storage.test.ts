import LocalStorageCache, { isAvailable } from '../local-storage';

describe('isAvailable', () => {
  it('should return true', () => {
    expect(isAvailable()).toBe(true);
  });

  it('should return false', () => {
    const mock = jest.spyOn(localStorage.__proto__, 'setItem').mockImplementation(() => {
      throw 'TestError [localStorage.setItem]';
    });

    expect(isAvailable()).toBe(false);
    mock.mockClear();
    mock.mockReset();
  });
});

describe('LocalStorageCache', () => {
  beforeEach(() => {
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date('2021-01-01T09:00:00'));
  });

  const originalStorage = window.localStorage;

  beforeEach(() => {
    const data: Record<string, string> = {};

    const storageMock: Storage = {
      getItem: key => {
        return data[key] || null;
      },
      setItem: (key, value) => {
        data[key] = value;
      },
      removeItem: key => {
        delete data[key];
      },
      clear: jest.fn(),
      key: jest.fn(() => null),
      length: 0,
    };

    Object.defineProperty(window, 'localStorage', { value: storageMock });
  });

  afterAll(() => {
    Object.defineProperty(window, 'localStorage', { value: originalStorage });
  });

  it('should always be UTC', () => {
    expect(new Date().getTimezoneOffset()).toBe(0);
  });

  describe('get', () => {
    it('should return value', () => {
      const key = 'test-key';
      const value = JSON.stringify({ value: 123, expire: Date.now() + 100000 });

      localStorage.setItem(key, value)

      expect(LocalStorageCache.get(key)).toBe(123);
    });

    it('should return null when store has no such key', () => {
      const key = 'test-key2';

      expect(LocalStorageCache.get(key)).toBe(null);
    });

    it('should return null when expired', () => {
      const key = 'test-another-key';
      const value = JSON.stringify({ value: 123, expire: Date.now() - 100000 });

      localStorage.setItem(key, value)

      expect(LocalStorageCache.get(key)).toBe(null);
    });
  });

  it('set', () => {
    const key = 'test-key';
    const value = 234;

    LocalStorageCache.set(key, value);

    expect(localStorage.getItem(key)).toBe(JSON.stringify({ value: 234, expire: 1609495200000 }));
  });

  describe('quotaExceeded', () => {
    it('ls isQuotaExceeded method works properly', () => {
      expect(LocalStorageCache.quotaExceeded({ code: 22 })).toBeTruthy();
      expect(LocalStorageCache.quotaExceeded({ code: 100 })).toBeFalsy();
      expect(LocalStorageCache.quotaExceeded({
        code: 1014,
        name: 'NS_ERROR_DOM_QUOTA_REACHED',
      })).toBeTruthy();
      expect(LocalStorageCache.quotaExceeded({ number: -2147024882 })).toBeTruthy();
    });

    it(`ls isQuotaExceeded method works properly
    if error name !== NS_ERROR_DOM_QUOTA_REACHED and error number !== 2147024882`, () => {
      expect(LocalStorageCache.quotaExceeded({ code: 22 })).toBeTruthy();
      expect(LocalStorageCache.quotaExceeded({ code: 100 })).toBeFalsy();
      expect(LocalStorageCache.quotaExceeded({
        code: 1014,
        name: 'SOME ERROR NAME',
      })).toBeFalsy();
      expect(LocalStorageCache.quotaExceeded({ number: -123 })).toBeFalsy();
    });

    it('ls isQuotaExceeded method works properly without error', () => {
      expect(LocalStorageCache.quotaExceeded(undefined)).toBeFalsy();
    });
  });
});
