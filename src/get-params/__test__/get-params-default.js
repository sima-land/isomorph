import getParams from '../get-params';

describe('getParams default', () => {
  const defaultValue = {
    api_host: '',
  };
  it('returns default value', () => {
    expect(getParams(
      { request: {}, config: {}, getValue: () => {}, modify: null, defaultValue })).toEqual(defaultValue);
  });
  it('returns not default value', () => {
    expect(getParams(
      { request: {}, config: {}, getValue: () => 'foo', modify: null, defaultValue })).toEqual('foo');
  });
  it('returns modified value', () => {
    expect(getParams({ request: {}, config: {}, getValue: () => 2, modify: v => v * 2 })).toEqual(4);
  });
});
