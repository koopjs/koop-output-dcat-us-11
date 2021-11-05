export const baseDatasetTemplate = {
  title: '{{name}}',
  description: '{{description}}',
  keyword: '{{tags}}',
  issued: '{{created:toISO}}',
  modified: '{{modified:toISO}}',
  publisher: {
    name: '{{source}}'
  },
  contactPoint: {
    '@type': 'vcard:Contact',
    fn: '{{owner}}',
    hasEmail: '{{orgContactEmail:optional}}'
  },
  accessLevel: 'public',
  spatial: '{{extent}}'
};
