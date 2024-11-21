import { readableFromArray, streamToString } from '../test-helpers/stream-utils';
import { getDataStreamDcatUs } from './';
import * as datasetFromApi from '../test-helpers/mock-dataset.json';
import { HEADER_V_3_0 } from './constants/contexts';

async function generateDcatFeed(dataset, template, templateTransforms, version) {
  const { stream: dcatStream } = getDataStreamDcatUs(template, templateTransforms, version);

  const docStream = readableFromArray([dataset]); // no datasets since we're just checking the catalog
  const feedString = await streamToString(docStream.pipe(dcatStream));
  return { feed: JSON.parse(feedString) };
}

describe('generating DCAT-US 1.1 feed', () => {
  const version = '1.1';
  it('formats catalog correctly', async function () {
    const { feed } = await generateDcatFeed([], {}, {}, version);

    expect(feed['@context']).toBe('https://project-open-data.cio.gov/v1.1/schema/catalog.jsonld');
    expect(feed['@type']).toBe('dcat:Catalog');
    expect(feed['conformsTo']).toBe('https://project-open-data.cio.gov/v1.1/schema');
    expect(feed['describedBy']).toBe('https://project-open-data.cio.gov/v1.1/schema/catalog.json');
    expect(Array.isArray(feed['dataset'])).toBeTruthy();
  });

  it('should interprolate dataset stream to feed based upon template', async function () {
    const { feed } = await generateDcatFeed(datasetFromApi, {
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
      }
    },
      {
        toISO: (_key, val) => {
          return new Date(val).toISOString();
        }
      },
      version);

    expect(feed['@context']).toBe('https://project-open-data.cio.gov/v1.1/schema/catalog.jsonld');
    expect(feed['@type']).toBe('dcat:Catalog');
    expect(feed['conformsTo']).toBe('https://project-open-data.cio.gov/v1.1/schema');
    expect(feed['describedBy']).toBe('https://project-open-data.cio.gov/v1.1/schema/catalog.json');
    expect(Array.isArray(feed['dataset'])).toBeTruthy();
    expect(feed['dataset'].length).toBe(1);
    const feedResponse = feed['dataset'][0];
    expect(feedResponse.title).toBe('Tahoe places of interest');
    expect(feedResponse.description).toBe('Description. Here be Tahoe things. You can do a lot here. Here are some more words. And a few more.<div><br /></div><div>with more words</div><div><br /></div><div>adding a few more to test how long it takes for our jobs to execute.</div><div><br /></div><div>Tom was here!</div>');
    expect(feedResponse.issued).toBe('2021-01-29T15:34:38.000Z');
    expect(feedResponse.modified).toBe('2021-07-27T20:25:19.723Z');
    expect(feedResponse.contactPoint).toStrictEqual({ '@type': 'vcard:Contact', fn: 'thervey_qa_pre_a_hub' });
    expect(feedResponse.publisher).toStrictEqual({ name: 'QA Premium Alpha Hub' });
    expect(feedResponse.keyword).toStrictEqual(['Data collection', 'just modified']);
  });
});

describe('generating DCAT-US 3.0 feed', () => {
  const version = '3.0';
  it('formats catalog correctly', async function () {
    const { feed } = await generateDcatFeed([], {}, {}, version);

    expect(feed['@context']).toStrictEqual(HEADER_V_3_0['@context']);
    expect(feed['conformsTo']).toBe('https://resource.data.gov/profile/dcat-us#');
    expect(feed['@type']).toBe('dcat:Catalog');
    expect(Array.isArray(feed['dcat:dataset'])).toBeTruthy();
  });

  it('should interprolate dataset stream to feed based upon template', async function () {
    const { feed } = await generateDcatFeed(datasetFromApi, {
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
      header: {
        '@id': 'hub.arcgis.com'
      }
    },
      {
        toISO: (_key, val) => {
          return new Date(val).toISOString();
        }
      },
      version);

    expect(feed['@context']).toStrictEqual(HEADER_V_3_0['@context']);
    expect(feed['@type']).toBe('dcat:Catalog');
    expect(feed['@id']).toBe('hub.arcgis.com');
    expect(feed['conformsTo']).toBe('https://resource.data.gov/profile/dcat-us#');
    expect(Array.isArray(feed['dcat:dataset'])).toBeTruthy();
    expect(feed['dcat:dataset'].length).toBe(1);
    const feedResponse = feed['dcat:dataset'][0];
    expect(feedResponse.title).toBe('Tahoe places of interest');
    expect(feedResponse.description).toBe('Description. Here be Tahoe things. You can do a lot here. Here are some more words. And a few more.<div><br /></div><div>with more words</div><div><br /></div><div>adding a few more to test how long it takes for our jobs to execute.</div><div><br /></div><div>Tom was here!</div>');
    expect(feedResponse.issued).toBe('2021-01-29T15:34:38.000Z');
    expect(feedResponse.modified).toBe('2021-07-27T20:25:19.723Z');
    expect(feedResponse.contactPoint).toStrictEqual({ '@type': 'vcard:Contact', fn: 'thervey_qa_pre_a_hub' });
    expect(feedResponse.publisher).toStrictEqual({ name: 'QA Premium Alpha Hub' });
    expect(feedResponse.keyword).toStrictEqual(['Data collection', 'just modified']);
  });
});
