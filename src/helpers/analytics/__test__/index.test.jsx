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
  const TestComponent = ({ prop }) => {
    const fn = useAnalytics({
      n: 'test-event',
      prop,
    });

    return createElement('div', { 'data-testid': 'test-block', onClick: fn });
  };

  beforeAll(() => {
    window.oko = { push: jest.fn() };
  });

  afterAll(() => {
    delete window.oko;
  });

  it('should call', () => {
    const container = document.createElement('div');

    document.body.append(container);

    render(<TestComponent prop={123} />, container);

    expect(window.oko.push).toHaveBeenCalledTimes(0);

    act(() => {
      Simulate.click(container.querySelector('[data-testid="test-block"]'));
    });

    expect(window.oko.push).toHaveBeenCalledTimes(1);
    expect(window.oko.push).toHaveBeenCalledWith({
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
