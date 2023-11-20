import { FetchUtil } from '../utils';

describe('FetchUtil', () => {
  it('setParams', () => {
    const url = new URL('https://www.test.com/tests/fetch-util?five=stub');

    FetchUtil.setParams(url, {
      one: '1',
      two: 2,
      three: true,
      four: false,
      five: null,
      six: undefined,
    });

    expect(url.searchParams.get('one')).toBe('1');
    expect(url.searchParams.get('two')).toBe('2');
    expect(url.searchParams.get('three')).toBe('true');
    expect(url.searchParams.get('four')).toBe('false');
    expect(url.searchParams.get('five')).toBe(null);
    expect(url.searchParams.get('six')).toBe(null);
  });

  it('withParams', () => {
    const inputUrl = new URL('https://www.test.com/tests/fetch-util?five=stub');

    const outputUrl = FetchUtil.withParams(inputUrl, {
      one: '1',
      two: 2,
      three: true,
      four: false,
      five: null,
      six: undefined,
    });

    expect(inputUrl.searchParams.get('one')).toBe(null);
    expect(inputUrl.searchParams.get('two')).toBe(null);
    expect(inputUrl.searchParams.get('three')).toBe(null);
    expect(inputUrl.searchParams.get('four')).toBe(null);
    expect(inputUrl.searchParams.get('five')).toBe('stub');
    expect(inputUrl.searchParams.get('six')).toBe(null);

    expect(outputUrl.searchParams.get('one')).toBe('1');
    expect(outputUrl.searchParams.get('two')).toBe('2');
    expect(outputUrl.searchParams.get('three')).toBe('true');
    expect(outputUrl.searchParams.get('four')).toBe('false');
    expect(outputUrl.searchParams.get('five')).toBe(null);
    expect(outputUrl.searchParams.get('six')).toBe(null);
  });

  it('withoutParams', () => {
    const inputUrl = FetchUtil.withParams('https://www.test.com/tests/fetch-util', {
      one: '1',
      two: 2,
      three: true,
      four: false,
      five: null,
      six: undefined,
    });

    expect(inputUrl.searchParams.get('one')).toBe('1');
    expect(inputUrl.searchParams.get('two')).toBe('2');
    expect(inputUrl.searchParams.get('three')).toBe('true');
    expect(inputUrl.searchParams.get('four')).toBe('false');
    expect(inputUrl.searchParams.get('five')).toBe(null);
    expect(inputUrl.searchParams.get('six')).toBe(null);

    const outputUrl = FetchUtil.withoutParams(inputUrl);

    expect(outputUrl.search).toBe('');
    expect(outputUrl.searchParams.get('one')).toBe(null);
    expect(outputUrl.searchParams.get('two')).toBe(null);
    expect(outputUrl.searchParams.get('three')).toBe(null);
    expect(outputUrl.searchParams.get('four')).toBe(null);
    expect(outputUrl.searchParams.get('five')).toBe(null);
    expect(outputUrl.searchParams.get('six')).toBe(null);
  });
});
