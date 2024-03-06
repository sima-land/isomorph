import { toMilliseconds } from '../math';

describe('toMilliseconds', () => {
  it('should works properly', () => {
    expect(toMilliseconds(300000000n)).toBe(300);
  });
});
