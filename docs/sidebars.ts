import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/quick-start',
        'getting-started/installation',
        'getting-started/configuration',
      ],
    },
    {
      type: 'category',
      label: 'Features',
      items: [
        'features/domains',
        'features/leads',
        'features/lead-discovery',
        'features/campaigns',
        'features/templates',
        'features/voicemail',
        'features/escalations',
        'features/analytics',
      ],
    },
    {
      type: 'category',
      label: 'Tutorials',
      items: [
        'tutorials/getting-started',
        'tutorials/first-campaign',
        'tutorials/finding-leads',
        'tutorials/email-templates',
        'tutorials/voicemail-drops',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'reference/api',
        'reference/template-variables',
        'reference/troubleshooting',
        'reference/faq',
      ],
    },
    'changelog',
  ],
};

export default sidebars;
