import { Request, Response } from 'express';
import * as config from 'config';
import * as _ from 'lodash';

import { fetchSite, getHubApiUrl, getPortalApiUrl, hubApiRequest, IHubRequestOptions, RemoteServerError } from '@esri/hub-common';
import { IContentSearchRequest } from '@esri/hub-search';

import { version } from '../package.json';
import { getDataStreamDcatUs11 } from './dcat-us';

const portalUrl = config.has('arcgisPortal')
  ? (config.get('arcgisPortal') as string)
  : 'https://www.arcgis.com';

/**
  * This function converts adlib'ed fields from the specified catalog into valid API fields used
  * to query the API for catalog content.
  * 
  * For fields that specify a path hierarchy using the || operator,
  * process each field as an API field EXCEPT for the last one.
  * The last field is interpreted as EITHER a templated value (e.g. `"modifed")
  * OR a literal value (e.g. "my literal value")
  * See "Path Hierarchies and Defaults" at https://github.com/Esri/adlib
  * 
  * Because the last field can be interpreted as either, with no syntax to differentiate,
  * the last field will be treated as a literal if it is not a valid Hub API field. As such,
  * it is not converted to a Hub API field
  * 
  * @param dependencies - list of fields processed by adlib to use when building the catalog
  * @returns - a list of valid Hub API fields
*/
async function getApiTermsFromDependencies (dependencies: string[]) {
  if (!dependencies || !Array.isArray(dependencies)) return undefined;

  // Only get valid Hub API fields if they are needed
  const doesPathHierarchyExist = dependencies.filter(dep => dep.includes('||')).length;
  const validApiFields: string[] = doesPathHierarchyExist ? await hubApiRequest('fields') : [];
  const validApiFieldMap = validApiFields.reduce((fieldMap, field) => {
    fieldMap[field] = true;
    return fieldMap;
  }, {});

  return Array.from(new Set(_.flatten(dependencies.map(dep => {
    // Dependency could indicate a hierarchial path (e.g. orgEmail || author)
    if (dep.includes('||')) {
      const providedSubDeps = dep.split('||').map(subDep => subDep.trim()).filter(subDep => !!subDep);
      const returnedSubDeps = [];

      // Assume all non-last fields are valid API fields
      for (let i = 0; i < providedSubDeps.length - 1; i++) {
        returnedSubDeps.push(providedSubDeps[i].split('.')[0]);
      }

      // Only push the last one if its a valid API field
      if (validApiFieldMap[providedSubDeps[providedSubDeps.length - 1]]) {
        returnedSubDeps.push(providedSubDeps[providedSubDeps.length - 1].split('.')[0]);
      }

      return returnedSubDeps;
    }
    return dep.split('.')[0];
  }))));
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

      const apiTerms = await getApiTermsFromDependencies(dependencies);

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
        fields: Array.isArray(fields) && fields.length > 0 ? fields.join(',') : undefined
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
        fields: Array.isArray(fields) && fields.length > 0 ? fields.join(',') : undefined
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
