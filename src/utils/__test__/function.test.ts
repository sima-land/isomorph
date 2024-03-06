import { safetyAsync } from '../function';

describe('safetyAsync', () => {
  it('should return safe async function', async () => {
    const fn = safetyAsync((n: number) =>
      n % 2 === 0 ? Promise.resolve('even') : Promise.reject('odd'),
    );

    expect(await fn(2)).toEqual({ ok: true, result: 'even' });
    expect(await fn(3)).toEqual({ ok: false, error: 'odd' });
  });
});
