import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Deep Outbound Documentation',
  tagline: 'Automated outbound sales for domain sellers',
  favicon: 'img/favicon.png',

  future: {
    v4: true,
  },

  url: 'https://docs.deepoutbound.com',
  baseUrl: '/',

  organizationName: 'ds1',
  projectName: 'outbound-workflow',

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'warn',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/', // Docs at root instead of /docs
        },
        blog: false, // Disable blog
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/deepoutbound-social-card.png',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Deep Outbound',
      logo: {
        alt: 'Deep Outbound Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          to: '/tutorials/getting-started',
          label: 'Tutorials',
          position: 'left',
        },
        {
          type: 'dropdown',
          label: 'Feedback',
          position: 'left',
          items: [
            {
              href: 'https://feedback.deepoutbound.com/feature-requests',
              label: 'Feature Requests',
            },
            {
              href: 'https://feedback.deepoutbound.com/bugs',
              label: 'Bug Reports',
            },
            {
              href: 'https://feedback.deepoutbound.com/integrations',
              label: 'Integrations',
            },
            {
              href: 'https://feedback.deepoutbound.com/roadmap',
              label: 'Roadmap',
            },
          ],
        },
        {
          href: 'https://deepoutbound.com',
          label: 'Website',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/getting-started/quick-start',
            },
            {
              label: 'Campaigns',
              to: '/features/campaigns',
            },
            {
              label: 'Lead Discovery',
              to: '/features/lead-discovery',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'Tutorials',
              to: '/tutorials/getting-started',
            },
            {
              label: 'API Reference',
              to: '/reference/api',
            },
            {
              label: 'Troubleshooting',
              to: '/reference/troubleshooting',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Feature Requests',
              href: 'https://feedback.deepoutbound.com/feature-requests',
            },
            {
              label: 'Report a Bug',
              href: 'https://feedback.deepoutbound.com/bugs',
            },
            {
              label: 'Integrations',
              href: 'https://feedback.deepoutbound.com/integrations',
            },
            {
              label: 'Roadmap',
              href: 'https://feedback.deepoutbound.com/roadmap',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Deep Outbound. All rights reserved.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['json', 'bash'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
