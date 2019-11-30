import getParams, { parseHttpHeaders, getParams as getParameters } from '../';

describe('getParams default', () => {
  const defaultValue = {
    api_host: '',
  };
  it('returns default value', () => {
    expect(getParams(
      { request: {}, config: {}, getValue: () => {}, modify: null, defaultValue }
    )).toEqual(defaultValue);
  });
  it('returns not default value', () => {
    expect(getParams(
      { request: {}, config: {}, getValue: () => 'foo', modify: null, defaultValue }
    )).toEqual('foo');
  });
  it('returns modified value', () => {
    expect(getParams({ request: {}, config: {}, getValue: () => 2, modify: v => v * 2 })).toEqual(4);
  });
});

describe('getParameters', () => {
  const defaultValue = {
    api_host: '',
  };
  it('did`t throw errors with blank params', () => {
    expect(getParameters()).toEqual();
  });
  it('returns default value', () => {
    expect(getParameters({}, {}, () => {}, null, defaultValue)).toEqual(defaultValue);
  });
  it('returns not default value', () => {
    expect(getParameters({}, {}, () => 'foo', null, defaultValue)).toEqual('foo');
  });
  it('returns modified value', () => {
    expect(getParameters({}, {}, () => 2, v => v * 2)).toEqual(4);
  });
});

describe('parseHttpHeaders', () => {
  const params = {
    foo: 'bar',
  };
  const request = {
    headers: {
      'simaland-params': JSON.stringify(params),
    },
  };
  const requestWithBrokenJson = {
    headers: {
      'simaland-params': 'broken',
    },
  };
  it('did`t throw errors with blank params', () => {
    expect(parseHttpHeaders()).toEqual(null);
  });
  it('returns params', () => {
    expect(parseHttpHeaders(request)).toEqual(params);
  });
  it('returns correct params in ASCII have been passed', () => {
    const encodingParams = {
      id: 1,
      name: 'RUB',
      grapheme: 'â½',
      description: 'Ð Ð¾ÑÑÐ¸Ð¹ÑÐºÐ¸Ð¹ ÑÑÐ±Ð»Ñ',
    };
    const encodingRequest = {
      headers: {
        'simaland-params': JSON.stringify(encodingParams),
      },
    };
    expect(parseHttpHeaders(encodingRequest)).toEqual({
      id: 1,
      name: 'RUB',
      grapheme: '₽',
      description: 'Российский рубль',
    });
  });
  it('throws error with broken JSON ', () => {
    expect(() => parseHttpHeaders(requestWithBrokenJson))
      .toThrowError('Unexpected token b in JSON at position 0');
  });
  it('returns null with no `simaland-params` header', () => {
    expect(parseHttpHeaders({ headers: {} })).toEqual(null);
  });
});
