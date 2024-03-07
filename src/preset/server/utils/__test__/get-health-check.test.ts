import { getHealthCheck } from '../get-health-check';

describe('healthCheck', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('handler should return response', async () => {
    const handler = getHealthCheck();
    const request = new Request('');

    const res1 = await handler(request);
    expect(res1.headers.get('content-type')).toBe('application/json');
    expect(await res1.json()).toEqual({ uptime: 0 });

    jest.advanceTimersByTime(1000);

    const res2 = await handler(request);
    expect(res2.headers.get('content-type')).toBe('application/json');
    expect(await res2.json()).toEqual({ uptime: 1000 });
  });
});
