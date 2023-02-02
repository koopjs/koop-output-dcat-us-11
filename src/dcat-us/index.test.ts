import { readableFromArray, streamToString } from '../test-helpers/stream-utils';
import { getDataStreamDcatUs11 } from './';
import { DcatDatasetTemplate } from './dataset-formatter';
import { IModel } from '@esri/hub-common';

const hostname = 'css-monster-qa-pre-hub.hubqa.arcgis.com';

async function generateDcatFeed(
  hostname: string,
  datasets: any[],
  feedTemplate?: DcatDatasetTemplate
) {
  const siteModel = { item: { url: hostname } } as unknown as IModel;

  const { stream: dcatStream } = getDataStreamDcatUs11({}, {});

  const docStream = readableFromArray(datasets); // no datasets since we're just checking the catalog

  const feedString = await streamToString(docStream.pipe(dcatStream));

  return { feed: JSON.parse(feedString) };
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
});
