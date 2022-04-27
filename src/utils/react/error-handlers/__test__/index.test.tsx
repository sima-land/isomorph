import React from 'react';
import { render } from '@testing-library/react';
import { ErrorBoundary, SafeSuspense } from '..';

describe('ErrorBoundary', () => {
  const error = new Error('Test error');

  const FailedComponent = () => {
    throw error;
  };

  it('should render children component', () => {
    const { container } = render(
      <ErrorBoundary fallback={null}>
        <div>Normal component</div>
      </ErrorBoundary>,
    );

    expect(container.textContent).toContain('Normal component');
    expect(container).toMatchSnapshot();
  });

  it('should render fallback component', () => {
    const { container } = render(
      <ErrorBoundary fallback={<div>Fallback</div>}>
        <>
          <div>Normal component</div>
          <FailedComponent />
        </>
      </ErrorBoundary>,
    );

    expect(container.textContent).toContain('Fallback');
    expect(container).toMatchSnapshot();
  });

  it('should call captureException', () => {
    const handlerException = jest.fn();

    const { container } = render(
      <ErrorBoundary fallback={null} onError={handlerException}>
        <>
          <div>Normal component</div>
          <FailedComponent />
        </>
      </ErrorBoundary>,
    );

    expect(handlerException).toBeCalledWith(error, { componentStack: expect.any(String) });
    expect(container).toMatchSnapshot();
  });
});

describe('SafeSuspense', () => {
  it('should render with props', () => {
    const { container } = render(
      <SafeSuspense fallback={<div>Fallback</div>} onError={jest.fn()}>
        <div>Normal component</div>
      </SafeSuspense>,
    );

    expect(container).toMatchSnapshot();
  });
});
