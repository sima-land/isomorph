import { defineSharedConfig } from '../index';

describe('defineSharedConfig', () => {
  it('should return correct base modules', () => {
    expect(defineSharedConfig()).toEqual([
      {
        react: {
          singleton: true,
        },
        'react-dom': {
          singleton: true,
        },
      },
      'react/jsx-runtime',
      'react-redux',
      '@reduxjs/toolkit',
      'redux-saga',
      'redux-saga/',
      'classnames',
      'classnames/',
      'axios',
      '@olime/cq-ch',
      '@sentry/browser',
    ]);
  });
});

describe('defineSharedConfig.expand', () => {
  it('should expand and ignore override base modules', () => {
    expect(
      defineSharedConfig.expand([
        'module',
        'react-dom',
        {
          otherModule: '^1.2.3',
          anotherModule: { requiredVersion: '^4.5.6' },
          axios: { singleton: true },
        },
      ]),
    ).toEqual({
      module: {},
      otherModule: '^1.2.3',
      anotherModule: { requiredVersion: '^4.5.6' },
      react: {
        singleton: true,
      },
      'react-dom': {
        singleton: true,
      },
      'react/jsx-runtime': {},
      'react-redux': {},
      '@reduxjs/toolkit': {},
      'redux-saga': {},
      'redux-saga/': {},
      classnames: {},
      'classnames/': {},
      axios: {},
      '@olime/cq-ch': {},
      '@sentry/browser': {},
    });
  });

  it('should work with various collections', () => {
    expect(defineSharedConfig.expand(['module', { anotherModule: '^1.2.3' }])).toMatchObject({
      module: {},
      anotherModule: '^1.2.3',
    });
    expect(defineSharedConfig.expand({ module: '', anotherModule: '^1.2.3' })).toMatchObject({
      module: {},
      anotherModule: '^1.2.3',
    });
  });
});

describe('defineSharedConfig.override', () => {
  it('should expand and ignore override base modules', () => {
    expect(
      defineSharedConfig.override([
        'module',
        'react-dom',
        {
          otherModule: '^1.2.3',
          anotherModule: { requiredVersion: '^4.5.6' },
          axios: { singleton: true },
          react: false,
        },
      ]),
    ).toEqual({
      'react/jsx-runtime': {},
      'react-redux': {},
      '@reduxjs/toolkit': {},
      'redux-saga': {},
      'redux-saga/': {},
      classnames: {},
      'classnames/': {},
      '@olime/cq-ch': {},
      '@sentry/browser': {},
      module: {},
      'react-dom': {},
      otherModule: '^1.2.3',
      anotherModule: { requiredVersion: '^4.5.6' },
      axios: { singleton: true },
    });
  });
});
