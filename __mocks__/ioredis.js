export const mockSet = jest.fn();
export const mockGet = jest.fn();
export const mockOn = jest.fn();

/**
 * Mock функции Redis
 */
export default function Redis () {
  this.on = mockOn;
  this.get = mockGet;
  this.set = mockSet;
}
