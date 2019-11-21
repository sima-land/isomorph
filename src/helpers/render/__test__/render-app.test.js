import renderApp from '../render-app';

describe('renderApp', () => {
  it('should call template with correct data', () => {
    const appData = {
      test: 'test',
      app: 'app',
      data: 'data',
    };
    const template = jest.fn();

    /**
     * Возвращает тестовые данные приложения.
     * @return {Object} Данные приложения.
     */
    const getAppData = () => appData;

    renderApp({ template, getAppData });

    expect(template).toBeCalledWith(appData);
  });
});
