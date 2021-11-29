import { Request, Response } from 'express';
import * as config from 'config';
import * as _ from 'lodash';

import { version } from '../package.json';
import { getDataStreamDcatUs11 } from './dcat-us';
import { fetchSite, getHubApiUrl, getPortalApiUrl, IHubRequestOptions, RemoteServerError } from '@esri/hub-common';
import { IContentSearchRequest } from '@esri/hub-search';

const portalUrl = config.has('arcgisPortal')
  ? (config.get('arcgisPortal') as string)
  : 'https://www.arcgis.com';

function getApiTermsFromDependencies (dependencies: string[]) {
  // Hub API only supports scoping by top-level terms
  return Array.from(new Set(dependencies.map(dep => dep.split('.')[0])));
}

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
      const hostname = req.hostname;
      const siteModel = await this.fetchSite(hostname, this.getRequestOptions(portalUrl));

      // Use dcatConfig query param if provided, else default to site's config
      let dcatConfig = typeof req.query.dcatConfig === 'string'
        ? this.parseProvidedDcatConfig(req.query.dcatConfig as string)
        : req.query.dcatConfig;

      if (!dcatConfig) {
        dcatConfig = _.get(siteModel, 'data.feeds.dcatUS11');
      }

      // TODO: We only pass in hostname because some site item urls are out of sync, causing invalid urls for
      // landingPage and identifier. If we can resolve the syncing issues, we can omit hostname and just use
      // the absolute url we get from getContentSiteUrls()
      const { stream: dcatStream, dependencies } = getDataStreamDcatUs11(hostname, siteModel, dcatConfig);

      const apiTerms = getApiTermsFromDependencies(dependencies);

      // Request a single dataset if id is provided, else default to site's catalog
      const id = String(req.query.id || '');
      req.res.locals.searchRequest = this.getDatasetSearchRequest(id, portalUrl, apiTerms) || this.getCatalogSearchRequest(_.get(siteModel, 'data.catalog'), portalUrl, apiTerms);

      const datasetStream = await this.getDatasetStream(req);

      datasetStream
        .pipe(dcatStream)
        .pipe(res)
        .on('error', (err: any) => {
          res.status(500).send(this.getErrorResponse(err));
        });
    } catch (err) {
      res.status(err.status || 500).send(this.getErrorResponse(err));
    }
  }

  private async fetchSite(hostname: string, opts: IHubRequestOptions) {
    try {
      return await fetchSite(hostname, opts);
    } catch (err) {

      // Throw 404 if domain does not exist (first) or site is private (second)
      if (err.message.includes(':: 404') || err.response?.error?.code === 403) {
        throw new RemoteServerError(err.message, null, 404);
      }
      throw new RemoteServerError(err.message, null, 500);
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

  private parseProvidedDcatConfig(dcatConfig: string) {
    try {
      return JSON.parse(dcatConfig);
    } catch (err) {
      return undefined;
    }
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

  private async getDatasetStream(req: Request) {
    try {
      return await this.model.pullStream(req);
    } catch (err) {
      if (err.status === 400) {
        throw new RemoteServerError(err.message, null, 400);
      }
      throw new RemoteServerError(err.message, null, 500);
    }
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
