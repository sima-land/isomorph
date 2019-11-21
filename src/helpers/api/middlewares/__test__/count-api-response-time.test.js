import createCountApiResponseTimeMiddleware from '../count-api-response-time';

describe('function createCountApiResponseTimeMiddleware', () => {
  const timeDataKey = 'testProp';
  it('creates function for collecting log data from API responses', () => {
    const response = {};
    expect(createCountApiResponseTimeMiddleware({ response, timeDataKey })).toBeInstanceOf(Function);
  });
  describe('function for collecting log data from API responses', () => {
    it('adds logData to express without logData', async () => {
      const response = {
        config: {
          url: 'https://www.sima-land.ru/api/v3/item/2180825/',
          method: 'get',
        },
        locals: {},
      };
      const next = jest.fn(() => response);
      const responseInterceptor = createCountApiResponseTimeMiddleware({ response, timeDataKey });
      const apiResponse = await responseInterceptor(response, next);
      expect(apiResponse.config.url).toEqual('https://www.sima-land.ru/api/v3/item/2180825/');
      expect(apiResponse.config.method).toEqual('get');
    });
    it('adds logData to express with logData', async () => {
      jest.spyOn(process, 'hrtime')
        .mockImplementation(() => [2, 50000000]);
      const response = {
        config: {
          url: 'https://www.sima-land.ru/api/v3/item/2180825/',
          method: 'get',
        },
        locals: {
          [timeDataKey]: {},
        },
      };
      const next = jest.fn(() => response);
      const responseInterceptor = createCountApiResponseTimeMiddleware({ response, timeDataKey });
      const apiResponse = await responseInterceptor(response, next);
      expect(apiResponse.config.url).toEqual('https://www.sima-land.ru/api/v3/item/2180825/');
      expect(apiResponse.config.method).toEqual('get');
      expect(apiResponse.locals[timeDataKey]).toEqual({
        'GET https://www.sima-land.ru/api/v3/item/ID/': 2050,
      });
    });
  });
});
