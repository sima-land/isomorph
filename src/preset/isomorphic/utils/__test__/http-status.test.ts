import { HttpStatus } from '../http-status';

describe('HttpStatus', () => {
  it('isOk', () => {
    expect(HttpStatus.isOk(200)).toBe(true);
    expect(HttpStatus.isOk(201)).toBe(false);
    expect(HttpStatus.isOk(199)).toBe(false);
  });

  it('isPostOk', () => {
    expect(HttpStatus.isPostOk(201)).toBe(true);
    expect(HttpStatus.isPostOk(200)).toBe(false);
    expect(HttpStatus.isPostOk(300)).toBe(false);
    expect(HttpStatus.isPostOk(400)).toBe(false);
  });

  it('isDeleteOk', () => {
    expect(HttpStatus.isDeleteOk(204)).toBe(true);
    expect(HttpStatus.isDeleteOk(200)).toBe(true);
    expect(HttpStatus.isDeleteOk(199)).toBe(false);
    expect(HttpStatus.isDeleteOk(300)).toBe(false);
    expect(HttpStatus.isDeleteOk(400)).toBe(false);
  });

  describe('createMiddleware', () => {
    const middleware = HttpStatus.axiosMiddleware();

    it('should NOT change validateStatus when is already defined as null', async () => {
      const config = { validateStatus: null };
      const next = jest.fn();
      const defaults = { headers: {} as any };

      await middleware(config, next, defaults);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(config);
    });

    it('should NOT set validateStatus when is already defined as function', async () => {
      const config = { validateStatus: () => false };
      const next = jest.fn();
      const defaults = { headers: {} as any };

      await middleware(config, next, defaults);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(config);
    });

    it('should NOT set validateStatus when is already defined as null in defaults', async () => {
      const config = {};
      const next = jest.fn();
      const defaults = { headers: {} as any, validateStatus: null };

      await middleware(config, next, defaults);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(config);
    });

    it('should NOT set validateStatus when is already defined as function in defaults', async () => {
      const config = {};
      const next = jest.fn();
      const defaults = { headers: {} as any, validateStatus: () => false };

      await middleware(config, next, defaults);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(config);
    });

    it('should set validateStatus for known statuses in config', async () => {
      const cases: Array<[string | undefined, (status: unknown) => boolean]> = [
        [undefined, HttpStatus.isOk],
        ['get', HttpStatus.isOk],
        ['GET', HttpStatus.isOk],
        ['put', HttpStatus.isOk],
        ['PUT', HttpStatus.isOk],
        ['post', HttpStatus.isPostOk],
        ['POST', HttpStatus.isPostOk],
        ['delete', HttpStatus.isDeleteOk],
        ['DELETE', HttpStatus.isDeleteOk],
      ];

      for (const [method, validator] of cases) {
        const config = { method };
        const next = jest.fn();
        const defaults = { headers: {} as any };

        await middleware(config, next, defaults);
        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith({ ...config, validateStatus: validator });
      }
    });
  });
});
