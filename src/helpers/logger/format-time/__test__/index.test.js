import formatTime from '..';

describe('formatTime()', () => {
  it('works correctly', () => {
    jest.spyOn(Date.prototype, 'toISOString')
      .mockImplementation(() => 'test ISO date');
    const formattedTime = formatTime();

    expect(formattedTime).toBe(',"time":"test ISO date"');
  });
});
