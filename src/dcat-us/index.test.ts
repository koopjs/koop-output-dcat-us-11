import { IItem } from '@esri/arcgis-rest-portal';
import { readableFromArray, streamToString } from '../test-helpers/stream-utils';
import { getDataStreamDcatUs11 } from './';
import * as datasetFromApi from '../test-helpers/mock-dataset.json';

function generateDcatFeed(
  siteItem,
  datasets,
) {
  const dcatStream = getDataStreamDcatUs11(siteItem);

  const docStream = readableFromArray(datasets); // no datasets since we're just checking the catalog

  return streamToString(docStream.pipe(dcatStream)).then(JSON.parse);
}

const siteItem: IItem = {
  id: '884d15dd172c4040b1ed49c0b67b9fff',
  owner: 'qa_pre_a_hub_admin',
  created: 1621349684000,
  isOrgItem: true,
  modified: 1621354324000,
  guid: null,
  name: null,
  title: 'Jules Goes The Distance',
  type: 'Hub Site Application',
  typeKeywords: [
    'Hub',
    'hubSite',
    'hubSolution',
    'JavaScript',
    'Map',
    'Mapping Site',
    'Online Map',
    'OpenData',
    'Ready To Use',
    'selfConfigured',
    'source-934d07d3f163470ab9125e585a0f59fe',
    'source-undefined',
    'Web Map',
    'Registered App',
  ],
  description:
    'Create your own initiative by combining existing applications with a custom site. Use this initiative to form teams around a problem and invite your community to participate.',
  tags: ['Hub Site'],
  snippet:
    'I love front end development and everyone I\'ve met as Esri so far has been really nice and pleasant and I am excited to get to know everyone better yes',
  thumbnail: null,
  documentation: null,
  extent: [],
  categories: [],
  spatialReference: null,
  accessInformation: null,
  licenseInfo: null,
  culture: 'ba-ei',
  properties: {
    schemaVersion: 1.4,
    children: [],
    collaborationGroupId: 'd8ae262d6e524c64965b3906fb8947cf',
    contentGroupId: '879d8747fa58421f91b3110210d46af2',
    followersGroupId: '1d1d555aabdf41fab2ee5b638e3ee504',
    parentInitiativeId: 'fc1e8cde86d443079e8c5dbb200f78f2',
    parentId: '2098f09abe314cfaa0319be9a6245790',
  },
  advancedSettings: null,
  url: 'https://jules-goes-the-distance-qa-pre-a-hub.hubqa.arcgis.com',
  proxyFilter: null,
  access: 'shared',
  size: -1,
  subInfo: 0,
  appCategories: [],
  industries: [],
  languages: [],
  largeThumbnail: null,
  banner: null,
  screenshots: [],
  listed: false,
  ownerFolder: '6d22b9f922074ac4bec7c16ac3c48127',
  protected: true,
  numComments: 0,
  numRatings: 0,
  avgRating: 0,
  numViews: 71,
  scoreCompleteness: 45,
  groupDesignations: null,
  contentOrigin: 'self',
};

describe('generating DCAT-AP 2.0.1 feed', () => {
  it('formats catalog correctly', async function () {
    const feed = await generateDcatFeed(siteItem, []);

    expect(feed['@context']).toBe('https://project-open-data.cio.gov/v1.1/schema/catalog.jsonld');
    expect(feed['@type']).toBe('dcat:Catalog');
    expect(feed['conformsTo']).toBe('https://project-open-data.cio.gov/v1.1/schema');
    expect(feed['describedBy']).toBe('https://project-open-data.cio.gov/v1.1/schema/catalog.json');
    expect(Array.isArray(feed['dataset'])).toBeTruthy();
    expect(feed['dataset'].length).toBe(0);
  });

  it('populates dataset array', async function () {
    const feed = await generateDcatFeed(siteItem, [
      datasetFromApi,
    ]);

    const chk1 = feed['dataset'][0];

    expect(chk1).toEqual(datasetFromApi);
  });
});
