import React from 'react';
import { renderToString } from 'react-dom/server';
import getReactMarkupData from '../get-react-markup-data';

jest.mock('react-dom/server', () => {
  const original = jest.requireActual('react-dom/server');
  return {
    ...original,
    __esModule: true,
    renderToString: jest.fn(original.renderToString),
  };
});

describe('getReactMarkupData()', () => {
  /**
   * Тестовый компонент.
   * @return {ReactElement} Компонент.
   */
  const TestComponent = () => (<div>Test</div>);
  const store = {
    getState: jest.fn(() => ({ test: 'test' })),
    dispatch: jest.fn(),
    subscribe: jest.fn(),
  };

  it('should return markup', () => {
    const reactAppData = getReactMarkupData({
      app: TestComponent,
      store,
    });
    const testData = {
      test: 'test',
      data: 'data',
      markup: 'markup',
    };

    expect(reactAppData(testData)).toEqual({
      ...testData,
      markup: renderToString.mock.results[0].value,
    });
  });

  it('should return markup with custom key', () => {
    const reactAppData = getReactMarkupData({
      app: TestComponent,
      store,
      key: 'customKey',
    });
    const testData = {
      test: 'test',
      data: 'data',
      markup: 'markup',
    };

    expect(reactAppData(testData)).toEqual({
      ...testData,
      customKey: renderToString.mock.results[0].value,
    });
  });
});
