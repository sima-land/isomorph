// @ts-check

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'isomorph',
  tagline: 'Минималистичный фреймворк для быстрого старта frontend-микросервисов',
  url: 'https://sima-land.github.io',
  baseUrl: '/isomorph/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon-144.ico',

  // GitHub pages deployment config.
  organizationName: 'sima-land', // Usually your GitHub org/user name.
  projectName: 'isomorph', // Usually your repo name.

  i18n: {
    defaultLocale: 'ru',
    locales: ['ru'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        blog: false,
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: '@sima-land/isomorph',
        // logo: {
        //   alt: 'Логотипчик',
        //   src: 'img/logo.svg',
        // },
        items: [
          {
            href: 'https://github.com/sima-land/isomorph',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        copyright: `Copyright © ${new Date().getFullYear()} Sima-land dev team.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;