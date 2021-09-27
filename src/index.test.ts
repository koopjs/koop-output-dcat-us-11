import { mocked } from 'ts-jest/utils';

import { readableFromArray } from './test-helpers/stream-utils';
import * as express from 'express';
import * as request from 'supertest';

import * as mockDataset from './test-helpers/mock-dataset.json';
import * as mockSiteModel from './test-helpers/mock-site-model.json';

import { FeedFormatterStream } from './dcat-us/feed-formatter-stream';
import * as _ from 'lodash';

describe('Output Plugin', () => {
  let mockFetchSite;
  let mockConfigModule;
  let plugin;
  let app: express.Application;

  const siteHostName = 'download-test-qa-pre-a-hub.hubqa.arcgis.com';

  function buildPluginAndApp() {
    const Output = require('./');

    const plugin = new Output();
    plugin.model = {
      pullStream: jest.fn().mockResolvedValue(readableFromArray([mockDataset])),
    };

    app = express();
    app.get('/dcat', plugin.serve.bind(plugin));

    return [plugin, app];
  }

  beforeEach(() => {
    jest.resetModules();

    const { fetchSite } = require('@esri/hub-common');

    // this fancy code is just to _only_ mock some fns
    // and leave the rest alone
    jest.mock('@esri/hub-common', () => ({
      ...(jest.requireActual('@esri/hub-common') as object),
      fetchSite: jest.fn(),
    }));

    mockConfigModule = mocked(require('config'), true);
    jest.mock('config');

    mockFetchSite = mocked(fetchSite);

    mockFetchSite.mockResolvedValue(mockSiteModel);
  });

  it('is configured correctly', () => {
    [plugin, app] = buildPluginAndApp();

    expect(plugin.constructor.type).toBe('output');
    expect(plugin.constructor.version).toBeDefined();
    expect(plugin.constructor.routes).toEqual([
      {
        path: '/dcat-us/1.1',
        methods: ['get'],
        handler: 'serve',
      },
    ]);
  });

  it('handles a DCAT request', async () => {
    [plugin, app] = buildPluginAndApp();

    await request(app)
      .get('/dcat')
      .set('host', siteHostName)
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .expect((res) => {
        expect(res.body).toBeDefined();

        // perform some basic checks to make sure we have
        // something that looks like a DCAT feed
        const dcatStream = res.body;
        expect(dcatStream['@context']).toBeDefined();
        expect(dcatStream['@type']).toBe('dcat:Catalog');
        expect(dcatStream['dataset']).toBeInstanceOf(Array);
        expect(dcatStream['dataset'].length).toBe(1);
        expect(dcatStream['dataset'][0]['distribution']).toBeInstanceOf(Array);
      });

    const expressRequest: express.Request =
      plugin.model.pullStream.mock.calls[0][0];
    expect(expressRequest.res.locals.searchRequest).toEqual({
      filter: {
        group: [
          '3b9ffb00851f47dab74494018ffa00fb',
          '95cc82a857fb40038628eea0dfc0210f',
          '671f07ab39bc4ea5a345d523328ccc06',
          'e79e2021e843428e9e0dab77eadbd507',
          '28a62e584bf04d5e8ade7e23467b7457',
        ],
        orgid: 'Xj56SBi2udA78cC9',
      },
      options: {
        portal: 'https://www.arcgis.com',
        fields: '',
      },
    });
  });

  it('points at AGO environment from config', async () => {
    const qaPortal = 'https://qaext.arcgis.com';

    mockConfigModule.has.mockReturnValue(true);
    mockConfigModule.get.mockReturnValue(qaPortal);

    // rebuild plugin to trigger initialization code
    [plugin, app] = buildPluginAndApp();

    await request(app)
      .get('/dcat')
      .set('host', siteHostName)
      .expect('Content-Type', /application\/json/)
      .expect(200);

    expect(mockConfigModule.has).toHaveBeenCalledWith('arcgisPortal');
    expect(mockConfigModule.get).toHaveBeenCalledWith('arcgisPortal');

    const expressRequest: express.Request =
      plugin.model.pullStream.mock.calls[0][0];
    expect(expressRequest.res.locals.searchRequest.options.portal).toBe(
      qaPortal,
    );
  });

  it('sets status to 500 if something blows up', async () => {
    [plugin, app] = buildPluginAndApp();

    plugin.model.pullStream.mockRejectedValue(Error('Couldnt get stream'));

    await request(app)
      .get('/dcat')
      .set('host', siteHostName)
      .expect('Content-Type', /application\/json/)
      .expect(500)
      .expect((res) => {
        expect(res.body).toEqual({ error: 'Couldnt get stream' });
      });

    // TODO test stream error
  });

  it('Properly passes custom dcat configurations to getDataStreamDcatUs11', async () => {
    // Mock getDataStreamDcatUs11
    const { getDataStreamDcatUs11 } = require('./dcat-us');
    jest.mock('./dcat-us', () => ({
      getDataStreamDcatUs11: jest.fn(),
    }));
    const mockGetDataStreamDcatUs11 = mocked(getDataStreamDcatUs11);
    mockGetDataStreamDcatUs11.mockReturnValue(new FeedFormatterStream('{', '}', '', () => ''));

    // Change fetchSite's return value to include a custom dcat config
    const customConfigSiteModel: any = _.cloneDeep(mockSiteModel);
    customConfigSiteModel.data.feeds = {
      dcatUS11: {
        "title": "{{default.name}}",
        "description": "{{default.description}}",
        "keyword": "{{item.tags}}",
        "issued": "{{item.created:toISO}}",
        "modified": "{{item.modified:toISO}}",
        "publisher": { "name": "{{default.source.source}}" },
        "contactPoint": {
          "fn": "{{item.owner}}",
          "hasEmail": "{{org.portalProperties.links.contactUs.url}}"
        },
        "landingPage": "some silly standard",
      }
    }
    mockFetchSite.mockResolvedValue(customConfigSiteModel);

    [plugin, app] = buildPluginAndApp();

    await request(app)
      .get('/dcat')
      .set('host', siteHostName)
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .expect(() => {
        expect(mockGetDataStreamDcatUs11).toHaveBeenCalledWith(customConfigSiteModel.item, customConfigSiteModel.data.feeds.dcatUS11);
      });
  });
});
