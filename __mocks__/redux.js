export const createStore = jest.fn();
export const applyMiddleware = jest.fn(() => middlewares);
export const middlewares = {
  values: jest.fn(() => [1]),
};
