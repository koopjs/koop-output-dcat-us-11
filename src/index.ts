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

      req.res.locals.searchRequest = this.extractDatasetSearchRequest(req) || this.getCatalogSearchRequest(_.get(siteModel, 'data.catalog'), portalUrl, []);
      const datasetStream = await this.model.pullStream(req);

      const dcatCustomizations = this.extractDcatConfig(req) || _.get(siteModel, 'data.feeds.dcatUS11');
      const dcatStream = getDataStreamDcatUs11(siteModel.item, dcatCustomizations);

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


  private extractDcatConfig(req) {
    try {
      return JSON.parse(_.get(req, 'query.dcatConfig'));
    } catch (e) {
      // ?dcatConfig does not exist or it is invalid JSON
      return null;
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

  private extractDatasetSearchRequest(req): IContentSearchRequest {
    let searchRequest: IContentSearchRequest = null;
    const id = _.get(req, 'query.id');
    if (id) {
      searchRequest = this.getDatasetSearchRequest(id, portalUrl, []);
    }
    return searchRequest;
  }

  private getDatasetSearchRequest(
    id: string,
    portalUrl: string,
    fields: string[]
  ): IContentSearchRequest {
    const searchRequest: IContentSearchRequest = {
      filter: { id },
      options: {
        portal: portalUrl,
        fields: fields.join(',')
      },
    };
    return searchRequest;
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
