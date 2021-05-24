import React, { createElement } from 'react';
import { render } from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import { call } from '@redux-saga/core/effects';
import { okoPush, sendAnalytics, useAnalytics } from '..';

describe('sendAnalytics', () => {
  const testEvent = { n: 'test-event', key: 'value' };

  const gen = sendAnalytics({ n: 'test-event', key: 'value' });

  it('should yield call with send function', () => {
    expect(gen.next().value).toEqual(call(okoPush, testEvent));
  });
});

describe('useAnalytics', () => {
  const TestComponent = ({ prop }: any) => {
    const fn = useAnalytics({
      n: 'test-event',
      prop,
    });

    return createElement('div', { 'data-testid': 'test-block', onClick: fn });
  };

  beforeAll(() => {
    (window as any).oko = {
      push: jest.fn(),
    };
  });

  afterAll(() => {
    delete (window as any).oko;
  });

  it('should call', () => {
    const container = document.createElement('div');

    document.body.append(container);

    render(<TestComponent prop={123} />, container);

    expect((window as any).oko.push).toHaveBeenCalledTimes(0);

    act(() => {
      Simulate.click(container.querySelector('[data-testid="test-block"]'));
    });

    expect((window as any).oko.push).toHaveBeenCalledTimes(1);
    expect((window as any).oko.push).toHaveBeenCalledWith({
      n: 'test-event',
      prop: 123,
    });
  });

  it('should throw error', async () => {
    const container = document.createElement('div');

    document.body.append(container);

    render(<TestComponent prop={1} />, container);

    const renderWithError = () => {
      render(<TestComponent prop={2} />, container);
    };

    expect(renderWithError).toThrow(Error([
      'useAnalytics: Данные для аналитики изменились.',
      'Если необходимо использовать динамические данные, вынесите логику из React-компонента.',
    ].join('\n')));
  });
});

describe('okoPush', () => {
  beforeAll(() => {
    (window as any).oko = {
      checkContext: () => 123,

      push: jest.fn(function (data) {
        // имитируем реальную работу window.oko.push: в процессе удаляет data.n
        delete data.n;

        // имитируем реальную работу window.oko.push: в процессе вызывает другие методы с this
        this.checkContext();
      }),
    };
  });

  afterAll(() => {
    delete (window as any).oko;
  });

  it('should handle window.oko.push mutates object argument', () => {
    const testData = {
      n: 'test-event',
      prop1: 1,
      prop2: 2,
    };

    expect((window as any).oko.push).toBeCalledTimes(0);

    okoPush(testData);

    expect((window as any).oko.push).toBeCalledTimes(1);
    expect((window as any).oko.push.mock.calls[0][0]).toEqual({
      prop1: 1,
      prop2: 2,
    });
    expect(testData).toEqual({
      n: 'test-event',
      prop1: 1,
      prop2: 2,
    });
  });

  it('should handle window.oko.push absence', () => {
    delete (window as any).oko;

    expect(() => okoPush({ n: 'test-123' })).not.toThrow();
  });
});