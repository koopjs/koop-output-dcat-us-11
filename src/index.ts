import { Request, Response } from 'express';
import * as config from 'config';
import * as _ from 'lodash';

import { version } from '../package.json';
import { getDataStreamDcatUs11 } from './dcat-us';
import { fetchSite, getHubApiUrl, getPortalApiUrl, IHubRequestOptions } from '@esri/hub-common';
import { IContentSearchRequest } from '@esri/hub-search';

const portalUrl = config.has('arcgisPortal')
  ? (config.get('arcgisPortal') as string)
  : 'https://www.arcgis.com';

export = class OutputDcatUs11 {
  static type = 'output';
  static version = version;
  static routes = [
    {
      path: '/dcat-us/1.1',
      methods: ['get'],
      handler: 'serve',
    },
  ];

  model: any;

  public async serve(req: Request, res: Response) {
    res.set('Content-Type', 'application/json');

    try {
      const siteModel = await fetchSite(req.hostname, this.getRequestOptions(portalUrl));

      // Request a single dataset if id is provided, else default to site's catalog
      const id = String(req.query.id || '');
      req.res.locals.searchRequest = this.getDatasetSearchRequest(id, portalUrl, []) || this.getCatalogSearchRequest(_.get(siteModel, 'data.catalog'), portalUrl, []);
      const datasetStream = await this.model.pullStream(req);

      // Use dcatConfig query param if provided, else default to site's config
      const dcatConfig = req.query.dcatConfig || _.get(siteModel, 'data.feeds.dcatUS11');
      const dcatStream = getDataStreamDcatUs11(siteModel.item, dcatConfig);

      datasetStream
        .pipe(dcatStream)
        .pipe(res)
        .on('error', (err: any) => {
          res.status(500).send(this.getErrorResponse(err));
        });
    } catch (err) {
      res.status(500).send(this.getErrorResponse(err));
    }
  }

  private getRequestOptions(portalUrl: string): IHubRequestOptions {
    return {
      isPortal: false,
      hubApiUrl: getHubApiUrl(portalUrl),
      portal: getPortalApiUrl(portalUrl),
      authentication: null,
    };
  }

  private getCatalogSearchRequest(
    catalog: any,
    portalUrl: string,
    fields: string[]
  ): IContentSearchRequest {
    const searchRequest: IContentSearchRequest = {
      filter: {
        group: catalog.groups,
        orgid: catalog.orgId,
      },
      options: {
        portal: portalUrl,
        fields: fields.join(',')
      },
    };
    return searchRequest;
  }

  private getDatasetSearchRequest(
    id: string,
    portalUrl: string,
    fields: string[]
  ): IContentSearchRequest {
    if (!id) {
      return null;
    }

    return {
      filter: { id },
      options: {
        portal: portalUrl,
        fields: fields.join(',')
      },
    };
  }

  private getErrorResponse(err: any) {
    return {
      error: _.get(
        err,
        'message',
        'Encountered error while processing request',
      ),
    };
  }
};
