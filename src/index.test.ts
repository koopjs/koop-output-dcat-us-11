import { mocked } from 'ts-jest/utils';

import { readableFromArray } from './test-helpers/stream-utils';
import * as express from 'express';
import * as request from 'supertest';

import * as mockDataset from './test-helpers/mock-dataset.json';

describe('Output Plugin', () => {
  let mockConfigModule;
  let plugin;
  let app: express.Application;

  const siteHostName = 'download-test-qa-pre-a-hub.hubqa.arcgis.com';

  function buildPluginAndApp () {
    const Output = require('./');

    const plugin = new Output();
    plugin.model = {
      pullStream: jest.fn().mockResolvedValue(readableFromArray([mockDataset])),
    };

    app = express();
    app.get('/dcat', plugin.serve.bind(plugin));

    return [ plugin, app ];
  }

  beforeEach(() => {
    jest.resetModules();

    // const {
    //   lookupDomain,
    //   getSiteById,
    // } = require('@esri/hub-common');
    // // this fancy code is just to _only_ mock some fns
    // // and leave the rest alone
    // jest.mock('@esri/hub-common', () => ({
    //   ...(jest.requireActual('@esri/hub-common') as object),
    //   getSiteById: jest.fn(),
    //   lookupDomain: jest.fn()
    // }));

    mockConfigModule = mocked(require('config'), true);
    jest.mock('config');

    // mockLookupDomain = mocked(lookupDomain);
    // mockGetSite = mocked(getSiteById);

    // mockLookupDomain.mockResolvedValue(mockDomainRecord);
    // mockGetSite.mockResolvedValue(mockSiteModel);
  });

  it('is configured correctly', () => {
    [ plugin, app ] = buildPluginAndApp();

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
    [ plugin, app ] = buildPluginAndApp();

    await request(app)
      .get('/dcat')
      .set('host', siteHostName)
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .expect(res => {
        expect(res.body).toBeDefined();

        // perform some basic checks to make sure we have
        // something that looks like a DCAT feed
        const dcatStream = res.body;
        expect(dcatStream['@context']).toBeDefined();
        expect(dcatStream['@type']).toBe('dcat:Catalog');
        expect(dcatStream['dataset']).toBeInstanceOf(Array);
        expect(dcatStream['dataset'].length).toBe(1);
        // TODO - expect(dcatStream['dcat:dataset'][0]['dcat:distribution']).toBeInstanceOf(Array);
      });

    const expressRequest: express.Request = plugin.model.pullStream.mock.calls[0][0];
    expect(expressRequest.res.locals.searchRequest).toEqual({
      options: {
        portal: 'https://www.arcgis.com',
        site: siteHostName
        // TODO - fields: 'id,url,owner,name,type,typeKeywords,tags,description,culture,created,metadata,server,geometryType'
      }
    });
  });

  it('points at AGO environment from config', async () => {
    const qaPortal = 'https://qaext.arcgis.com';

    mockConfigModule.has.mockReturnValue(true);
    mockConfigModule.get.mockReturnValue(qaPortal);

    // rebuild plugin to trigger initialization code
    [ plugin, app ] = buildPluginAndApp();

    await request(app)
      .get('/dcat')
      .set('host', siteHostName)
      .expect('Content-Type', /application\/json/)
      .expect(200);

    expect(mockConfigModule.has).toHaveBeenCalledWith('arcgisPortal');
    expect(mockConfigModule.get).toHaveBeenCalledWith('arcgisPortal');

    const expressRequest: express.Request = plugin.model.pullStream.mock.calls[0][0];
    expect(expressRequest.res.locals.searchRequest.options.portal).toBe(qaPortal);
  });

  it('sets status to 500 if something blows up', async () => {
    [ plugin, app ] = buildPluginAndApp();

    plugin.model.pullStream.mockRejectedValue(Error('Couldnt get stream'));

    await request(app)
      .get('/dcat')
      .set('host', siteHostName)
      .expect('Content-Type', /application\/json/)
      .expect(500)
      .expect(res => {
        expect(res.body).toEqual({ error: 'Couldnt get stream' });
      });

    // TODO test stream error
  });

});
