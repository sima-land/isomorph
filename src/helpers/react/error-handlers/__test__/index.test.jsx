import React from 'react';
import { mount, shallow } from 'enzyme';
import { ErrorBoundary, SafeSuspense } from '../index';

describe('ErrorBoundary', () => {
  const error = new Error('Test error');

  const FailedComponent = () => {
    throw error;
  };
  it('should render children component', () => {
    const wrapper = mount(
      <ErrorBoundary fallback={null}>
        <div>Normal component</div>
      </ErrorBoundary>
    );

    expect(wrapper.text()).toContain('Normal component');
    expect(wrapper).toMatchSnapshot();
  });

  it('should render fallback component', () => {
    const wrapper = mount(
      <ErrorBoundary fallback={<div>Fallback</div>}>
        <>
          <div>Normal component</div>
          <FailedComponent />
        </>
      </ErrorBoundary>
    );

    expect(wrapper.text()).toContain('Fallback');
    expect(wrapper).toMatchSnapshot();
  });

  it('should call captureException', () => {
    const handlerException = jest.fn();

    const wrapper = mount(
      <ErrorBoundary captureException={handlerException} fallback={null}>
          <>
            <div>Normal component</div>
            <FailedComponent />
          </>
      </ErrorBoundary>
    );

    expect(handlerException).toBeCalledWith(error, { componentStack: expect.any(String) });
    expect(wrapper).toMatchSnapshot();
  });
});

describe('SafeSuspense', () => {
  it('should render with props', () => {
    const wrapper = shallow(
      <SafeSuspense
        fallback={<div>Fallback</div>}
        captureException={jest.fn()}
      >
        <div>Normal component</div>
      </SafeSuspense>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
