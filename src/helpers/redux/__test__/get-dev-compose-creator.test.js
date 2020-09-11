import getDevComposeCreator from '../get-dev-compose-creator';

describe('getDevComposeCreator', () => {
  it('returns __REDUX_DEVTOOLS_EXTENSION_COMPOSE__ window property value', () => {
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = () => {};
    expect(getDevComposeCreator()).toBe(window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__);
    delete window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
  });
  it('returns null if __REDUX_DEVTOOLS_EXTENSION_COMPOSE__ window property is not defined', () => {
    expect(getDevComposeCreator()).toBe(null);
  });
});
