import { readableFromArray, streamToString } from '../test-helpers/stream-utils';
import { getDataStreamDcatUs11 } from './';

import * as datasetFromApi from '../test-helpers/mock-dataset.json';
import { DcatDatasetTemplate } from './dataset-formatter';
import { IModel } from '@esri/hub-common';

const hostname = 'css-monster-qa-pre-hub.hubqa.arcgis.com';

async function generateDcatFeed(
  hostname: string,
  datasets: any[],
  dcatCustomizations?: DcatDatasetTemplate
) {
  const siteModel = { item: { url: hostname } } as unknown as IModel;

  const { stream: dcatStream, dependencies } = getDataStreamDcatUs11(hostname, siteModel, dcatCustomizations);

  const docStream = readableFromArray(datasets); // no datasets since we're just checking the catalog

  const feedString = await streamToString(docStream.pipe(dcatStream));

  return { feed: JSON.parse(feedString), dependencies };
}

describe('generating DCAT-US 1.1 feed', () => {
  it('formats catalog correctly', async function () {
    const { feed } = await generateDcatFeed(hostname, []);

    expect(feed['@context']).toBe('https://project-open-data.cio.gov/v1.1/schema/catalog.jsonld');
    expect(feed['@type']).toBe('dcat:Catalog');
    expect(feed['conformsTo']).toBe('https://project-open-data.cio.gov/v1.1/schema');
    expect(feed['describedBy']).toBe('https://project-open-data.cio.gov/v1.1/schema/catalog.json');
    expect(Array.isArray(feed['dataset'])).toBeTruthy();
    expect(feed['dataset'].length).toBe(0);
  });

  it('populates dataset array', async function () {
    const { feed } = await generateDcatFeed(hostname, [
      datasetFromApi,
    ]);

    const chk1 = feed['dataset'][0];

    expect(chk1['@type']).toBe('dcat:Dataset');
    expect(chk1.identifier).toBe('https://www.arcgis.com/home/item.html?id=f4bcc1035b7d46cba95e977f4affb6be&sublayer=0');
    expect(chk1.license).toBe('');
    expect(chk1.landingPage).toBe('https://css-monster-qa-pre-hub.hubqa.arcgis.com/datasets/qa-pre-a-hub::tahoe-places-of-interest');
    expect(chk1.title).toBe('Tahoe places of interest');
    expect(chk1.description).toBe('Description. Here be Tahoe things. You can do a lot here. Here are some more words. And a few more.<div><br /></div><div>with more words</div><div><br /></div><div>adding a few more to test how long it takes for our jobs to execute.</div><div><br /></div><div>Tom was here!</div>');
    expect(chk1.keyword).toEqual([ 'Data collection', 'just modified' ]);
    expect(chk1.issued).toBe('2021-01-29T15:34:38.000Z');
    expect(chk1.modified).toBe('2021-07-27T20:25:19.723Z');
    expect(chk1.publisher).toEqual({ name: 'QA Premium Alpha Hub' });
    expect(chk1.contactPoint).toEqual({ '@type': 'vcard:Contact', fn: 'thervey_qa_pre_a_hub' });
    expect(chk1.accessLevel).toBe('public');
    expect(chk1.spatial).toBe('-121.1180,38.7754,-119.0090,39.3590');
    expect(chk1.theme).toEqual(['geospatial']);

    expect(chk1.distribution).toBeInstanceOf(Array);
    expect(chk1.distribution.length).toBe(6);
  });

  it('respects dcat customizations of overwritable attributes', async function () {
    const { feed } = await generateDcatFeed(
      hostname,
      [datasetFromApi],
      {
        description: '{{name}}', // overwrite existing attribute
        customField: '{{name}}' // add new attribute
      }
    );

    const chk1 = feed['dataset'][0];

    expect(chk1['@type']).toBe('dcat:Dataset');
    expect(chk1.identifier).toBe('https://www.arcgis.com/home/item.html?id=f4bcc1035b7d46cba95e977f4affb6be&sublayer=0');
    expect(chk1.license).toBe('');
    expect(chk1.landingPage).toBe('https://css-monster-qa-pre-hub.hubqa.arcgis.com/datasets/qa-pre-a-hub::tahoe-places-of-interest');
    expect(chk1.title).toBe('Tahoe places of interest');
    expect(chk1.description).toBe('Tahoe places of interest');
    expect(chk1.customField).toBe('Tahoe places of interest');
    expect(chk1.keyword).toEqual([ 'Data collection', 'just modified' ]);
    expect(chk1.issued).toBe('2021-01-29T15:34:38.000Z');
    expect(chk1.modified).toBe('2021-07-27T20:25:19.723Z');
    expect(chk1.publisher).toEqual({ name: 'QA Premium Alpha Hub' });
    expect(chk1.contactPoint).toEqual({ '@type': 'vcard:Contact', fn: 'thervey_qa_pre_a_hub' });
    expect(chk1.accessLevel).toBe('public');
    expect(chk1.spatial).toBe('-121.1180,38.7754,-119.0090,39.3590');
    expect(chk1.theme).toEqual(['geospatial']);

    expect(chk1.distribution).toBeInstanceOf(Array);
    expect(chk1.distribution.length).toBe(6);
  });

  it('scrubs dcat customization of protected fields', async function () {
    const { feed } = await generateDcatFeed(
      hostname,
      [datasetFromApi],
      {
        '@type': '{{name}}',
        landingPage: '{{name}}',
        webService: '{{name}}',
        distribution: '{{name}}',
        contactPoint: {
          '@type': '{{name}}',
          fn: '{{owner}}',
        }
      }
    );

    const chk1 = feed['dataset'][0];

    expect(chk1['@type']).toBe('dcat:Dataset');
    expect(chk1.identifier).toBe('https://www.arcgis.com/home/item.html?id=f4bcc1035b7d46cba95e977f4affb6be&sublayer=0');
    expect(chk1.license).toBe('');
    expect(chk1.webService).toBe(undefined);
    expect(chk1.landingPage).toBe('https://css-monster-qa-pre-hub.hubqa.arcgis.com/datasets/qa-pre-a-hub::tahoe-places-of-interest');
    expect(chk1.title).toBe('Tahoe places of interest');
    expect(chk1.description).toBe('Description. Here be Tahoe things. You can do a lot here. Here are some more words. And a few more.<div><br /></div><div>with more words</div><div><br /></div><div>adding a few more to test how long it takes for our jobs to execute.</div><div><br /></div><div>Tom was here!</div>');
    expect(chk1.keyword).toEqual([ 'Data collection', 'just modified' ]);
    expect(chk1.issued).toBe('2021-01-29T15:34:38.000Z');
    expect(chk1.modified).toBe('2021-07-27T20:25:19.723Z');
    expect(chk1.publisher).toEqual({ name: 'QA Premium Alpha Hub' });
    expect(chk1.contactPoint).toEqual({ 
      "@type": "vcard:Contact",
      fn: 'thervey_qa_pre_a_hub' 
    });
    expect(chk1.accessLevel).toBe('public');
    expect(chk1.spatial).toBe('-121.1180,38.7754,-119.0090,39.3590');
    expect(chk1.theme).toEqual(['geospatial']);

    expect(chk1.distribution).toBeInstanceOf(Array);
    expect(chk1.distribution.length).toBe(6);
  });

  it('reports default dependencies when no customizations', async () => {
    const { dependencies } = await generateDcatFeed(
      hostname,
      [datasetFromApi]
    );

    const expectedDependencies = [
      'id',
      'type',
      'slug',
      'access',
      'size',
      'licenseInfo',
      'structuredLicense',
      'layer.geometryType',
      'server.spatialReference',
      'metadata.metadata.distInfo.distTranOps.onLineSrc',
      'url',
      'name',
      'description',
      'tags',
      'created',
      'modified',
      'orgContactEmail',
      'source',
      'owner',
      'extent'
    ];

    expect(dependencies.length).toBe(expectedDependencies.length);
    expect(dependencies).toEqual(expect.arrayContaining(expectedDependencies));
  });

  it('reports custom dependencies when customizations provided', async () => {
    const { dependencies } = await generateDcatFeed(
      hostname,
      [datasetFromApi],
      {
        // overwrite some defaults
        keyword: '{{keyword}}',
        publisher: {
          name: '{{other.source}}'
        },
        // net-new
        foo: '{{foo.bar.baz}}',
        lolz: '{{lol.lol.lol}}'
      }
    );

    const expectedDependencies = [
      'id',
      'type',
      'slug',
      'access',
      'size',
      'licenseInfo',
      'structuredLicense',
      'layer.geometryType',
      'server.spatialReference',
      'metadata.metadata.distInfo.distTranOps.onLineSrc',
      'url',
      'name',
      'description',
      'created',
      'modified',
      'owner',
      'orgContactEmail',
      'extent',
      'keyword',
      'other.source',
      'foo.bar.baz',
      'lol.lol.lol'
    ];

    expect(dependencies.length).toBe(expectedDependencies.length);
    expect(dependencies).toEqual(expect.arrayContaining(expectedDependencies));
  });
});
