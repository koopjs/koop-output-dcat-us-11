import { Request, Response } from 'express';
import * as _ from 'lodash';
import { RemoteServerError } from '@esri/hub-common';
import { version } from '../package.json';
import { getDataStreamDcatUs11 } from './dcat-us';
import { TransformsList } from 'adlib';
import { getDcatErrorWithStatusCode } from './dcat-us/compile-dcat-feed';

export = class OutputDcatUs11 {
  static type = 'output';
  static version = version;
  static routes = [
    {
      path: '/dcat-us/1.1',
      methods: ['get'],
      handler: 'serve',
    },
    {
      path: '/data.json',
      methods: ['get'],
      handler: 'serve',
    },
  ];

  model: any;

  public async serve(req: Request, res: Response) {
    res.set('Content-Type', 'application/json');

    try {
      const { res: { locals: { feedTemplate } }, app: { locals: { feedTemplateTransforms } } }: {
        res?: {
          locals?: {
            feedTemplate?: any
          }
        }
        app: {
          locals: {
            feedTemplateTransforms?: TransformsList
          }
        }
      } = req;

      if (!feedTemplate) {
        throw getDcatErrorWithStatusCode('DCAT-US 1.1 feed template is not provided.', 400);
      }

      const { stream: dcatStream } = getDataStreamDcatUs11(feedTemplate, feedTemplateTransforms);

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