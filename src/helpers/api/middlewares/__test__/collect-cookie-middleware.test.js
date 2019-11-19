import createCollectCookieMiddleware from '../collect-cookie-middleware';

describe('createCollectCookieMiddleware', () => {
  it('creates collectCookieMiddleware instance correctly', () => {
    const collectCookieMiddleware = createCollectCookieMiddleware({
      response: {},
    });
    expect(collectCookieMiddleware).toBeInstanceOf(Function);
    expect(collectCookieMiddleware).toHaveLength(2);
  });
  describe('creates collectCookieMiddleware instance, which', () => {
    it('adds cookie header to app response, when cookie header is not defined in app response.', async () => {
      const apiResponse = { headers: { 'set-cookie': ['test0', 'test1', 'test2'] } };
      const appResponse = { get: jest.fn(), set: jest.fn() };
      const next = jest.fn(() => apiResponse);
      const collectCookieMiddleware = createCollectCookieMiddleware({ response: appResponse });
      await collectCookieMiddleware({}, next);
      expect(next).toHaveBeenCalledWith({});
      expect(appResponse.get).toHaveBeenCalledWith('set-cookie');
      expect(appResponse.set).toHaveBeenCalledWith('set-cookie', ['test0', 'test1', 'test2']);
    });
    it('keeps cookie header in app response, when api response cookies is not defined.', async () => {
      const appResponse = { get: jest.fn(() => ['test0', 'test1', 'test2']), set: jest.fn() };
      const next = jest.fn(() => ({}));
      const collectCookieMiddleware = createCollectCookieMiddleware({ response: appResponse });
      await collectCookieMiddleware({}, next);
      expect(appResponse.set).not.toHaveBeenCalled();
    });
    it('adds only unique cookie in app response', async () => {
      const appResponse = { get: jest.fn(() => ['test0', 'test1', 'test2']), set: jest.fn() };
      const apiResponse = { headers: { 'set-cookie': ['test1', 'test2', 'test3'] } };
      const next = jest.fn(() => apiResponse);
      const collectCookieMiddleware = createCollectCookieMiddleware({ response: appResponse });
      await collectCookieMiddleware({}, next);
      expect(appResponse.set).toHaveBeenCalledWith('set-cookie', ['test0', 'test1', 'test2', 'test3']);
    });
    it('does not set cookie if api response cookie is empty and app response cookie is empty', async () => {
      const appResponse = { get: jest.fn(), set: jest.fn() };
      const apiResponse = {};
      const next = jest.fn(() => apiResponse);
      const collectCookieMiddleware = createCollectCookieMiddleware({ response: appResponse });
      expect(appResponse.set).not.toHaveBeenCalled();
      await collectCookieMiddleware({}, next);
      expect(appResponse.set).not.toHaveBeenCalled();
    });
  });
});
