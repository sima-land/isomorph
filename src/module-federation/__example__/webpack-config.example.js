/**
 * Пример конфигурации webpack c использованием EnhancedModuleFederationPlugin.
 */
const ExtendedMFPlugin = require('../enhanced-module-federation-plugin');

/**
 * Пример конфигурации удаленного приложения.
 */
const RemoteServiceConfig = {
  entry: {},
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  plugins: [
    new ExtendedMFPlugin(
      {
        name: 'remote-service-name',
        filename:
            `remote-service-name/${process.env.CI_COMMIT_REF_NAME}/remoteEntry.${process.env.CI_COMMIT_SHORT_SHA}.js`,
        exposes: {
          './Modal': './src/desktop/index.tsx',
          './Screen': './src/mobile/index.tsx',
        },
      }
    ),
  ],
};

/**
 * Пример конфигурации приложения-хоста.
 */
const HostServiceConfig = {
  entry: './src/index.js',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  plugins: [
    new ExtendedMFPlugin(
      {
        name: 'host-service-name',
        remotes: {
          firstRemoteService: 'first-remote-service-name', // Путь к remote entry определяется в рантайме
          secondRemoteService: {
            name: 'second-remote-service-name', // Путь к remote entry определяется в рантайме
          },
          thirdRemoteService: {
            name: 'third-remote-service-name',
            remoteEntryPath: '//path/to/remoteEntry.js', // Путь к remote entry задан явно
          },
        },
      }
    ),
  ],
  resolve: {
    /**
     * В дев версии или SSR удаленные модули недоступны, указываем компонент-заглушку.
     */
    fallback: {
      'remoteService/Modal': './src/__mocks__/stub-component.js',
      'remoteService/Screen': './src/__mocks__/stub-component.js',
    },
  },
};

module.exports = [
  RemoteServiceConfig,
  HostServiceConfig,
];
