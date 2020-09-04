import { isOkoExists, sendAnalytics } from '..';

const windowSpy = jest.spyOn(global, 'window', 'get')
  .mockImplementation(() => undefined);

describe('isOkoExists()', () => {
  it('should return false when windows is undefined', () => {
    expect(isOkoExists()).toBe(false);
  });

  it('should return false when oko doesn`t exist', () => {
    windowSpy.mockRestore();
    window.oko = {};
    expect(isOkoExists()).toBe(false);
  });

  it('should return true when oko are exists', () => {
    windowSpy.mockRestore();
    window.oko = { push: jest.fn() };
    expect(isOkoExists()).toBe(true);
  });
});

describe('sendAnalytics()', () => {
  it('shouldn\'t push meta to oko when data isn\'t an object', () => {
    windowSpy.mockRestore();
    window.oko = { push: jest.fn() };
    sendAnalytics({ meta: null });
    expect(window.oko.push).not.toHaveBeenCalled();
  });

  it('should push meta to oko', () => {
    windowSpy.mockRestore();
    window.oko = { push: jest.fn() };
    sendAnalytics({ meta: {} });
    expect(window.oko.push).toHaveBeenCalledTimes(1);
  });
});
