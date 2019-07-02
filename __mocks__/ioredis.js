const callbacks = {};
export const mockSet = jest.fn();
export const mockGet = jest.fn();
export const mockOn = jest.fn((type, callback) => {
  callbacks[type] = callback;
});

/**
 * Mock функции Redis.
 */
export default function Redis () {
  this.on = mockOn;
  this.get = mockGet;
  this.set = mockSet;
}
