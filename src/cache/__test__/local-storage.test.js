import localStorageCache, {
  isAvailable,
  getItem,
  setItem,
} from '../local-storage';

jest.mock('../local-storage', () => {
  const original = jest.requireActual('../local-storage');
  return {
    ...original,
    __esModule: true,
    isAvailable: jest.fn(original.isAvailable),
  };
});

describe('localStorageCache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should contain necessary methods', () => {
    expect(isAvailable).toBeCalledTimes(0);

    expect(localStorageCache.get).toBe(getItem);
    expect(localStorageCache.set).toBe(setItem);
    expect(localStorageCache.status).toBe(isAvailable());

    expect(isAvailable).toBeCalledTimes(1);
  });
});

describe('isAvailable()', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true when local storage is available', () => {
    jest.spyOn(global, 'localStorage', 'get')
      .mockImplementation(() => ({}));

    expect(isAvailable()).toBe(true);
  });

  it('should return false when local storage is not available', () => {
    jest.spyOn(global, 'localStorage', 'get')
      .mockImplementation(() => undefined);

    expect(isAvailable()).toBe(false);
  });
});

describe('getItem()', () => {
  const key = 'testKey';
  const value = 'testValue';
  let getter;
  let remover;
  let fakeLocalStorage;

  beforeEach(() => {
    getter = () => JSON.stringify({
      value,
      expire: 100,
    });
    remover = jest.fn();
    fakeLocalStorage = { getItem: getter, removeItem: remover };
    jest.spyOn(global, 'localStorage', 'get')
      .mockImplementation(() => fakeLocalStorage);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return item from localStorage', () => {
    jest.spyOn(Date, 'now').mockImplementation(() => 0);

    expect(getItem(key)).toBe(value);
  });

  it('should return null if value was expired', () => {
    jest.spyOn(Date, 'now').mockImplementation(() => 2000);

    expect(getItem(key)).toBe(null);
    expect(remover).toBeCalledTimes(1);
  });

  it('should return null if is localStorage returned no an object', () => {
    fakeLocalStorage = { getItem: () => null, removeItem: remover };
    jest.spyOn(global, 'localStorage', 'get')
      .mockImplementation(() => fakeLocalStorage);

    expect(getItem(key)).toBe(null);
  });
});

describe('setItem()', () => {
  const key = 'testKey';
  const value = 'testValue';
  let setter;
  let fakeLocalStorage;

  beforeEach(() => {
    setter = jest.fn();
    fakeLocalStorage = { setItem: setter };
    jest.spyOn(global, 'localStorage', 'get')
      .mockImplementation(() => fakeLocalStorage);
    jest.spyOn(Date, 'now').mockImplementation(() => 0);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should add item to localStorage', () => {
    const duration = 1000;
    setItem(key, value, duration);

    expect(setter).toBeCalledWith(key, JSON.stringify({
      value,
      expire: 1000 * 1000,
    }));
  });

  it('should add item to localStorage with default duration', () => {
    const defaultDuration = 3600;
    setItem(key, value);

    expect(setter).toBeCalledWith(key, JSON.stringify({
      value,
      expire: defaultDuration * 1000,
    }));
  });
});
