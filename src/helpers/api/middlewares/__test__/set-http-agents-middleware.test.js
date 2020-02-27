import http from 'http';
import https from 'https';
import createSetHttpAgentsMiddleware from '../set-http-agents-middleware';

describe('createSetHttpAgentsMiddleware', () => {
  it('creates function for start tracing of API request', () => {
    const middleware = createSetHttpAgentsMiddleware({}, {});
    expect(middleware).toBeInstanceOf(Function);
    expect(middleware).toHaveLength(2);
  });

  describe('middleware for setting httpAgent and httpsAgent settings', () => {
    const next = jest.fn(() => ({ status: 200 }));
    const requestConfig = {
      baseURL: 'test.ru',
      url: '/test/url',
      method: 'get',
      headers: {
        testHeader: 'test',
      },
    };

    it('sets options httpAgent and httpsAgent in request configuration', async () => {
      const httpAgent = new http.Agent({ keepAlive: true });
      const httpsAgent = new https.Agent({ keepAlive: true });
      const middleware = createSetHttpAgentsMiddleware({ httpAgent, httpsAgent });
      await middleware(requestConfig, next);
      expect(next).toHaveBeenCalledWith({
        ...requestConfig,
        httpAgent,
        httpsAgent,
      });
    });

    it(`does not set options httpAgent and httpsAgent,
    if value of these options is not instance of http.Agent or https.Agent`, async () => {
      const middleware = createSetHttpAgentsMiddleware({ httpAgent: {}, httpsAgent: {} });
      await middleware(requestConfig, next);
      expect(next).toHaveBeenCalledWith(requestConfig);
    });
  });
});
