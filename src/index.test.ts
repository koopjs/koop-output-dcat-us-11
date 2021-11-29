import { mocked } from 'ts-jest/utils';

import { readableFromArray } from './test-helpers/stream-utils';
import * as express from 'express';
import * as request from 'supertest';

import * as mockDataset from './test-helpers/mock-dataset.json';
import * as mockSiteModel from './test-helpers/mock-site-model.json';
import { createMockKoopApp } from './test-helpers/create-mock-koop-app';

import { FeedFormatterStream } from './dcat-us/feed-formatter-stream';
import { IContentSearchRequest } from '@esri/hub-search';
import { IModel } from '@esri/hub-common';

import * as _ from 'lodash';

function buildPluginAndApp() {
  let Output;

  jest.isolateModules(() => {
    Output = require('./');
  });

  const plugin = new Output();
  plugin.model = {
    pullStream: jest.fn().mockResolvedValue(readableFromArray([mockDataset])),
  };

  const app = createMockKoopApp();
  app.get('/dcat', plugin.serve.bind(plugin));

  return [plugin, app];
}

describe('Output Plugin', () => {
  let mockFetchSite;
  let mockConfigModule;
  let plugin;
  let app: express.Application;

  const siteHostName = 'download-test-qa-pre-a-hub.hubqa.arcgis.com';

  beforeEach(() => {
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

    [plugin, app] = buildPluginAndApp();
  });

  afterEach(() => {
    const { get, has } = mockConfigModule;
    [get, has].forEach(mock => mock.mockReset());
  })

  it('is configured correctly', () => {
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
        fields: "id,type,slug,licenseInfo,structuredLicense,layer,server,metadata,url,name,description,tags,created,modified,source,owner,orgContactEmail,extent"      },
    });
  });

  it('points at AGO environment from config', async () => {
    const qaPortal = 'https://qaext.arcgis.com';

    mockConfigModule.has.mockReturnValue(true);
    mockConfigModule.get.mockReturnValue(qaPortal);

    // rebuild plugin to trigger initialization code
    const [localPlugin, localApp] = buildPluginAndApp();

    await request(localApp)
      .get('/dcat')
      .set('host', siteHostName)
      .expect('Content-Type', /application\/json/)
      .expect(200);

    expect(mockConfigModule.has).toHaveBeenCalledWith('arcgisPortal');
    expect(mockConfigModule.get).toHaveBeenCalledWith('arcgisPortal');

    const expressRequest: express.Request =
      localPlugin.model.pullStream.mock.calls[0][0];
    expect(expressRequest.res.locals.searchRequest.options.portal).toBe(
      qaPortal,
    );
  });

  it('sets status to 500 if something blows up', async () => {
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

  it('returns 400 when searchRequest returns 400', async () => {
    [ plugin, app ] = buildPluginAndApp();

    plugin.model = {
      pullStream: jest.fn().mockRejectedValue({ status: 400, message: 'A validation error' })
    }

    await request(app)
      .get('/dcat')
      .set('host', siteHostName)
      .expect('Content-Type', /application\/json/)
      .expect(400)
      .expect(res => {
        expect(plugin.model.pullStream).toHaveBeenCalledTimes(1);
        expect(res.body).toBeDefined();
        expect(res.body.error).toEqual('A validation error');
      });
  });

  it('returns 404 when provided domain does not exist and domain service returns appropriate message', async () => {
    [ plugin, app ] = buildPluginAndApp();

    mockFetchSite.mockRejectedValue({ message: 'DOMAIN DOES NOT EXIST :: 404' })
    await request(app)
      .get('/dcat')
      .set('host', siteHostName)
      .expect('Content-Type', /application\/json/)
      .expect(404)
      .expect(res => {
        expect(res.body).toBeDefined();
        expect(res.body.error).toEqual('DOMAIN DOES NOT EXIST :: 404');
      });
  });

  it('returns 500 when provided domain does not exist and domain service returns wrong message', async () => {
    [ plugin, app ] = buildPluginAndApp();

    mockFetchSite.mockRejectedValue({ message: 'DOMAIN DOES NOT EXIST :: 403' })
    await request(app)
      .get('/dcat')
      .set('host', siteHostName)
      .expect('Content-Type', /application\/json/)
      .expect(500)
      .expect(res => {
        expect(res.body).toBeDefined();
        expect(res.body.error).toEqual('DOMAIN DOES NOT EXIST :: 403');
      });
  });

  it('returns 404 when provided domain represents a private site', async () => {
    [ plugin, app ] = buildPluginAndApp();

    mockFetchSite.mockRejectedValue({ message: 'PRIVATE SITE', response: { error: { code: 403 } } })
    await request(app)
      .get('/dcat')
      .set('host', siteHostName)
      .expect('Content-Type', /application\/json/)
      .expect(404)
      .expect(res => {
        expect(res.body).toBeDefined();
        expect(res.body.error).toEqual('PRIVATE SITE');
      });
  });

  it('returns 500 when ArcGIS returns wrong error for a site item', async () => {
    [ plugin, app ] = buildPluginAndApp();

    mockFetchSite.mockRejectedValue({ message: 'PRIVATE SITE' })
    await request(app)
      .get('/dcat')
      .set('host', siteHostName)
      .expect('Content-Type', /application\/json/)
      .expect(500)
      .expect(res => {
        expect(res.body).toBeDefined();
        expect(res.body.error).toEqual('PRIVATE SITE');
      });
  });

  describe('configuration via query params', () => {
    let mockGetDataStreamDcatUs11;

    beforeAll(() => {
      const { getDataStreamDcatUs11 } = require('./dcat-us');
      jest.mock('./dcat-us');
      mockGetDataStreamDcatUs11 = mocked(getDataStreamDcatUs11)
        .mockReturnValue({
          stream: new FeedFormatterStream('{', '}', '', () => ''),
          dependencies: []
        });
    })

    it('Properly passes a site\'s custom dcat configurations to getDataStreamDcatUs11 when no dcatConfig is provided', async () => {
      // Change fetchSite's return value to include a custom dcat config
      const customConfigSiteModel: IModel = _.cloneDeep(mockSiteModel);
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

      await request(app)
        .get('/dcat')
        .set('host', siteHostName)
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .expect(() => {
          expect(mockGetDataStreamDcatUs11).toHaveBeenCalledWith(siteHostName, customConfigSiteModel, customConfigSiteModel.data.feeds.dcatUS11);
        });
    });

    it('Properly passes a valid stringified ?dcatConfig query param to getDataStreamDcatUs11', async () => {
      const dcatConfig = {
        planet: 'tatooine'
      }

      await request(app)
        .get(`/dcat?dcatConfig=${JSON.stringify(dcatConfig)}`)
        .set('host', siteHostName)
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .expect(() => {
          expect(mockGetDataStreamDcatUs11).toHaveBeenCalledWith(siteHostName, mockSiteModel, dcatConfig);
        });
    });

    it('Properly passes the ?dcatConfig query param as an object to getDataStreamDcatUs11', async () => {
      const dcatConfig = {
        planet: 'tatooine'
      }

      await request(app)
        .get('/dcat')
        .query({ dcatConfig })
        .set('host', siteHostName)
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .expect(() => {
          expect(mockGetDataStreamDcatUs11).toHaveBeenCalledWith(siteHostName, mockSiteModel, dcatConfig);
        });
    });

    it('Passes the site dcat config to getDataStreamDcatUs11 when ?dcatConfig is invalid json', async () => {
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

      await request(app)
        .get('/dcat?dcatConfig={"partial":"json')
        .set('host', siteHostName)
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .expect(() => {
          expect(mockGetDataStreamDcatUs11).toHaveBeenCalledWith(siteHostName, customConfigSiteModel, customConfigSiteModel.data.feeds.dcatUS11);
        });
    });

    it('Constructs a search request for specific dataset when the id query param is populated', async () => {
      await request(app)
        .get('/dcat?id=9001')
        .set('host', siteHostName)
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .expect(() => {
          const expectedSearchRequest: IContentSearchRequest = {
            filter: {
              id: '9001'
            },
            options: {
              portal: 'https://www.arcgis.com',
              fields: ''
            },
          };
          const actualSearchRequest = _.get(plugin.model.pullStream, 'mock.calls[0][0].res.locals.searchRequest')
          expect(actualSearchRequest).toStrictEqual(expectedSearchRequest);
        });
    });

    it('Uses the siteHostName instead of the dataset id', async () => {
      // Change fetchSite's return value to include a custom dcat config
      const customConfigSiteModel: IModel = _.cloneDeep(mockSiteModel);
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

      await request(app)
        .get('/dcat')
        .set('host', 'css-monster-qa-pre-hub.hubqa.arcgis.com')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .expect(() => {
          expect(mockGetDataStreamDcatUs11).toHaveBeenCalledWith('css-monster-qa-pre-hub.hubqa.arcgis.com', customConfigSiteModel, customConfigSiteModel.data.feeds.dcatUS11);
        });
    });
  });
});
