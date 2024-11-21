import { Request, Response } from 'express';
import * as _ from 'lodash';
import { version } from '../package.json';
import { getDataStreamDcatUs } from './dcat-us';
import { TransformsList } from 'adlib';
import { DcatUsError } from './dcat-us/dcat-us-error';

export = class OutputDcatUs {
  static type = 'output';
  static version = version;
  static routes = [
    {
      path: '/dcat-us/3.0', // DCAT US 3.0 is beta
      methods: ['get'],
      handler: 'serve',
    },
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
        throw new DcatUsError('DCAT-US 1.1 feed template is not provided.', 400);
      }

      const version = this.getVersion(_.get(req, 'path', ''));

      const { stream: dcatStream } = getDataStreamDcatUs(feedTemplate, feedTemplateTransforms, version);

      const datasetStream = await this.getDatasetStream(req);
      datasetStream.on('error', (err) => {
        if (req.next) {
          req.next(err);
        }
      }).pipe(dcatStream).pipe(res);

    } catch (err) {
      res.status(err.statusCode).send(this.getErrorResponse(err));
    }
  }

  private async getDatasetStream(req: Request) {
    try {
      return await this.model.pullStream(req);
    } catch (err) {
      if (err.status === 400) {
        throw new DcatUsError(err.message, 400);
      }
      throw new DcatUsError(err.message, 500);
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

  private getVersion(reqPath: string) {
    const version = reqPath.substring(reqPath.lastIndexOf('/') + 1);
    return ['1.1', '3.0'].includes(version) ? version : '1.1';
  }
};