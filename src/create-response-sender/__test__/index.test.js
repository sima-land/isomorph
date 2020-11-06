import createResponseSender from '../';

describe('createResponseSender()', () => {
  const response = {
    set: jest.fn(),
    send: jest.fn(),
    json: jest.fn(),
  };
  const devInstance = createResponseSender({ config: { isProduction: false }, response });
  const prodInstance = createResponseSender({ config: { isProduction: true }, response });

  it('should return function', () => {
    [devInstance, prodInstance].forEach(instance => {
      expect(instance).toBeInstanceOf(Function);
      expect(instance).toHaveLength(1);
    });
  });

  describe('production instance', () => {
    const options = {
      markup: 'test_markup',
      assets: {
        js: 'path_to_js',
        css: 'path_to_css',
        criticalJs: ['critical_js_code'],
      },
      store: {
        getState: jest.fn().mockReturnValue({ app: { dataLayer: { products: ['test_data'] } } }),
      },
    };

    it('should work correctly', () => {
      prodInstance(options);

      expect(response.json).toBeCalledWith({
        markup: 'test_markup',
        bundle_js: 'path_to_js',
        bundle_css: 'path_to_css',
        critical_js: ['critical_js_code'],
        meta: {
          products: ['test_data'],
        },
      });
    });

    it('should work correctly without assets', () => {
      prodInstance({ ...options, assets: {} });

      expect(response.json).toBeCalledWith({
        markup: 'test_markup',
        bundle_js: '',
        bundle_css: '',
        critical_js: [],
        meta: {
          products: ['test_data'],
        },
      });
    });
  });

  describe('development instance', () => {
    const options = {
      markup: 'test_markup',
    };

    it('should work correctly', () => {
      devInstance(options);

      expect(response.send).toBeCalledWith('test_markup');
    });

    it('should work correctly without assets', () => {
      devInstance({ ...options, headers: {} });

      expect(response.set).not.toBeCalled();
      expect(response.send).toBeCalledWith('test_markup');
    });
  });
});
