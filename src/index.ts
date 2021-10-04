import { Request, Response } from 'express';
import * as config from 'config';
import * as _ from 'lodash';

import { version } from '../package.json';
import { getDataStreamDcatUs11 } from './dcat-us';
import { fetchSite, getHubApiUrl, getPortalApiUrl, IHubRequestOptions } from '@esri/hub-common';
import { IContentSearchRequest, searchContent } from '@esri/hub-search';
import { PassThrough } from 'stream';

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

    const numBatches = 5;
    const pageSize = 100;

    try {
      // siteModel.data.feeds.dcatUS11
      const siteModel = await fetchSite('opendata.dc.gov', this.getRequestOptions(portalUrl));
      const totalResultSize = await this.getTotalResultSize(_.get(siteModel, 'data.catalog'), portalUrl);
      const pagesPerBatch = this.getPagesPerBatch(totalResultSize, numBatches, pageSize);

      const batchInitialPageKeys: string[] = this.getInitialPageKeys(numBatches, pagesPerBatch, pageSize);

      const datasetFetchStart = new Date().getTime();

      const datasetStreamPromises: Array<Promise<any>> = batchInitialPageKeys.map((key: string) => {
        const clone = _.cloneDeep(req);
        clone.res.locals.searchRequest = this.getSearchRequest(_.get(siteModel, 'data.catalog'), portalUrl, this.getFields(), key);
        clone.res.locals.pagesPerBatch = pagesPerBatch;
        return this.model.pullStream(clone);
      });

      const datasetStreams = await Promise.all(datasetStreamPromises);

      datasetStreams.forEach((stream) => {
        stream.on('close', () => {
          console.log(`**** FETCHED ALL PAGES IN ${new Date().getTime() - datasetFetchStart} MS`);
          console.log(`**** FASTEST PAGE FETCH TIME IS ${stream._getMinPageTime()} MS`);
        });

        stream.on('error', err => {
          console.log(err);
        });
      });

      let pass = new PassThrough({ objectMode: true });
      let waiting = datasetStreams.length;
      for (const stream of datasetStreams) {
          pass = stream.pipe(pass, {end: false});
          stream.once('end', () => {
            waiting--;
            if (waiting === 0) {
              console.log(`**** FETCHED ${this.model.getTotalResults()} RESULTS`);
              pass.emit('end');
            }
          });
            
      }

      const dcatStream = getDataStreamDcatUs11(siteModel.item, _.get(siteModel, 'data.feeds.dcatUS11'));

      pass
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
    fields: string[],
    pageKey?: string,
  ): IContentSearchRequest {
    const searchRequest: IContentSearchRequest = {
      filter: {
        group: catalog.groups,
        orgid: catalog.orgId,
      },
      options: {
        portal: portalUrl,
        fields: fields.join(','),
        page: pageKey,
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

  private async getTotalResultSize(catalog, portalUrl): Promise<number> {
    // Need the total number of results to determine pagination
    // Use this hardcoded page key
    // Don't return any results, just get total
    const key = 'eyJodWIiOnsic2l6ZSI6MH0sImFnbyI6eyJzaXplIjowfX0=';
    const request = this.getSearchRequest(catalog, portalUrl, [], key);
    if (!_.has(request, 'options.portal')) {
      _.set(request, 'options.portal', 'https://www.arcgis.com');
    }

    const response = await searchContent(request);
    return response.total;
  }

  private getPagesPerBatch(numResults, numBatches, pageSize): number {
    const resultsPerBatch = Math.trunc(numResults / numBatches) + 1;
    return Math.trunc(resultsPerBatch / pageSize) + 1;
  }

  private getInitialPageKeys(numBatches, pagesPerBatch, pageSize): string[] {
    const pageKeys = [];

    for (let i = 0; i < numBatches; i++) {
      pageKeys.push({
        hub: {
          size: pageSize,
          // Start at 1
          start: 1 + (i * pagesPerBatch * pageSize),
        },
        ago: {
          size: 0,
          start: 1,
        }
      });
    }

    return pageKeys.map((key) => {
      const json = JSON.stringify(key);
      const buffer = Buffer.from(json);
      return buffer.toString('base64');
    });
  }

  private getFields(): string[] {
    return [
      'id',
      'name',
      'description',
      'tags',
      'created',
      'modified',
      'source',
      'owner',
      'url',
      'geometryType',
      'hubType',
      'supportedExtensions',
      'server',
      'extent',
      'content',
      'typeKeywords',
      'licenseInfo',
      'structuredLicense',
      'metadata',
    ];
  }
};
