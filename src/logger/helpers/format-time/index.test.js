import formatTime from './index';

describe('formatTime()', () => {
  it('works correctly', () => {
    const date = new Date();
    const formattedTime = formatTime();

    expect(formattedTime).toBe(`,"time":"${date.toISOString()}"`);
  });
});
