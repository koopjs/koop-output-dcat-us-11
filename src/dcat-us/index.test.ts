import { readableFromArray, streamToString } from '../test-helpers/stream-utils';
import { getDataStreamDcatUs11 } from './';

import * as datasetFromApi from '../test-helpers/mock-dataset.json';
import * as mockSiteModel from '../test-helpers/mock-site-model.json';

function generateDcatFeed(
  siteItem,
  datasets,
) {
  const dcatStream = getDataStreamDcatUs11(siteItem);

  const docStream = readableFromArray(datasets); // no datasets since we're just checking the catalog

  return streamToString(docStream.pipe(dcatStream)).then(JSON.parse);
}


describe('generating DCAT-US 1.1 feed', () => {
  it('formats catalog correctly', async function () {
    const feed = await generateDcatFeed(mockSiteModel.item, []);

    expect(feed['@context']).toBe('https://project-open-data.cio.gov/v1.1/schema/catalog.jsonld');
    expect(feed['@type']).toBe('dcat:Catalog');
    expect(feed['conformsTo']).toBe('https://project-open-data.cio.gov/v1.1/schema');
    expect(feed['describedBy']).toBe('https://project-open-data.cio.gov/v1.1/schema/catalog.json');
    expect(Array.isArray(feed['dataset'])).toBeTruthy();
    expect(feed['dataset'].length).toBe(0);
  });

  it('populates dataset array', async function () {
    const feed = await generateDcatFeed(mockSiteModel.item, [
      datasetFromApi,
    ]);

    const chk1 = feed['dataset'][0];

    expect(chk1['@type']).toBe('dcat:Dataset');
    expect(chk1.identifier).toBe('https://download-test-qa-pre-a-hub.hubqa.arcgis.com/datasets/f4bcc1035b7d46cba95e977f4affb6be_0');
    expect(chk1.license).toBe('No license provided. Request permission to use.');
    expect(chk1.landingPage).toBe('https://download-test-qa-pre-a-hub.hubqa.arcgis.com/datasets/f4bcc1035b7d46cba95e977f4affb6be_0');
    expect(chk1.title).toBe('Tahoe places of interest');
    expect(chk1.description).toBe('Description. Here be Tahoe things. You can do a lot here. Here are some more words. And a few more.<div><br /></div><div>with more words</div><div><br /></div><div>adding a few more to test how long it takes for our jobs to execute.</div><div><br /></div><div>Tom was here!</div>');
    expect(chk1.keyword).toEqual([ 'Data collection', 'just modified' ]);
    expect(chk1.issued).toBe('2021-01-29T15:34:38.000Z');
    expect(chk1.modified).toBe('2021-07-27T20:25:19.723Z');
    expect(chk1.publisher).toEqual({ name: 'QA Premium Alpha Hub' });
    expect(chk1.contactPoint).toEqual({ '@type': 'vcard:Contact', fn: 'thervey_qa_pre_a_hub' });
    expect(chk1.accessLevel).toBe('public');
    expect(chk1.spatial).toBe('-121.118,38.7754,-119.009,39.359');
    expect(chk1.theme).toEqual(['geospatial']);

    expect(chk1.distribution).toBeInstanceOf(Array);
    expect(chk1.distribution.length).toBe(6);
  });
});
