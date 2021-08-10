// the base DCAT adlib template
export const baseTemplate = {
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
    // hasEmail: '{{org.portalProperties.links.contactUs.url:optional}}' TODO - re-enable when supported
  },
  accessLevel: 'public'
};
