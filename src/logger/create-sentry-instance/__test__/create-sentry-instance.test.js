import sentryTestkit from 'sentry-testkit';
import { createSentryInstance, deptToArg } from '../index';
import * as Sentry from '@sentry/browser';

const { testkit, sentryTransport } = sentryTestkit();

beforeEach(testkit.reset);

describe('createSentryInstance', () => {
  it('should be a Function', () => {
    expect(createSentryInstance).toBeInstanceOf(Function);
  });

  it('should throw error for incorrect arguments', () => {
    const BrowserClient = jest.fn();
    const NodeClient = jest.fn();
    const Hub = jest.fn();

    expect(() => createSentryInstance({ BrowserClient, Hub })).not.toThrow();
    expect(() => createSentryInstance({ NodeClient, Hub })).not.toThrow();

    expect(() => createSentryInstance({ Hub }))
      .toThrowError('Параметр "BrowserClient"/"NodeClient" должен быть функцией');
    expect(() => createSentryInstance({ BrowserClient }))
      .toThrowError('Параметр "Hub" должен быть функцией');
  });

  it('should create instance', () => {
    const instance = createSentryInstance(Sentry);
    expect(instance).toEqual({
      init: expect.any(Function),
      captureException: expect.any(Function),
      captureMessage: expect.any(Function),
      addBreadcrumb: expect.any(Function),
    });
  });
});

describe('Sentry instance', () => {
  const instance = createSentryInstance(Sentry);
  it('should initialize correctly', () => {
    instance.init({
      dsn: 'https://test@sentry.io/000001',
      release: 'test_release',
      environment: 'test_env',
      transport: sentryTransport,
    });

    expect(testkit.reports()).toHaveLength(0);

    instance.addBreadcrumb({ message: 'test_breadcrumb' });
    instance.captureException('test_exception');

    expect(testkit.reports()).toHaveLength(1);
    expect(testkit.reports()[0].breadcrumbs[0]).toMatchObject({ message: 'test_breadcrumb' });
    expect(testkit.reports()[0].message).toEqual('test_exception');
  });

  it('should be work correctly if other instance exists', () => {
    const firstInstance = createSentryInstance(Sentry);
    const secondInstance = createSentryInstance(Sentry);

    expect(firstInstance).not.toEqual(secondInstance);

    firstInstance.init({
      dsn: 'https://first_test@sentry.io/000001',
      release: 'first_release',
      transport: sentryTransport,
    });

    secondInstance.init({
      dsn: 'https://second_test@sentry.io/000001',
      release: 'second_release',
      transport: sentryTransport,
    });
    expect(testkit.reports()).toHaveLength(0);

    firstInstance.captureException('first_exception_from_first_instance');
    secondInstance.captureException('exception_from_second_instance');
    firstInstance.captureException('next_exception_from_first_instance');

    expect(testkit.reports()).toHaveLength(3);
    expect(testkit.reports()[0].release).toEqual('first_release');
    expect(testkit.reports()[1].release).toEqual('second_release');
    expect(testkit.reports()[2].release).toEqual('first_release');
  });
});

describe('deptToArg()', () => {
  it('should work correctly', () => {
    const dept = { sentry: 'test' };
    expect(deptToArg(dept)).toEqual(['test']);
  });
});
