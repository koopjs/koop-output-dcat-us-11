import { readableFromArray, streamToString } from '../test-helpers/stream-utils';
import { getDataStreamDcatUs11 } from './';
import * as datasetFromApi from '../test-helpers/mock-dataset.json';

async function generateDcatFeed(dataset, template, templateTransforms) {
  // const siteModel = { item: { url: hostname } } as unknown as IModel;

  const { stream: dcatStream } = getDataStreamDcatUs11(template, templateTransforms);

  const docStream = readableFromArray([dataset]); // no datasets since we're just checking the catalog
  const feedString = await streamToString(docStream.pipe(dcatStream));
  return { feed: JSON.parse(feedString) };
}

describe('generating DCAT-US 1.1 feed', () => {
  it('formats catalog correctly', async function () {
    const { feed } = await generateDcatFeed([], {}, {});

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
    }, {
      toISO: (_key, val) => {
        return new Date(val).toISOString();
      }
    });

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
