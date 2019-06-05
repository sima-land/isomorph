import { hrtimeToInteger } from './index';

describe('hrtimeToInteger()', () => {
  it('returns timestmap when call with correct parameters', () => {
    const time = hrtimeToInteger([13434, 982613281]);

    expect(time).toBe(13434982613281);
  });

  it('returns 0 when call with incorrect parameters', () => {
    expect(hrtimeToInteger()).toBe(0);
    expect(hrtimeToInteger('string')).toBe(0);
  });
});
