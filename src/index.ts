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

      req.res.locals.searchRequest = this.getSearchRequest(_.get(siteModel, 'data.catalog'), portalUrl, []);

      const datasetStream = await this.model.pullStream(req);

      const dcatStream = getDataStreamDcatUs11(siteModel.item);

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

  private getSearchRequest(
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
