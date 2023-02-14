import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import * as middleware from 'koop/lib/middleware';
import { join } from 'path';

/**
 * Creates a mock Koop Express application for testing.
 *
 * This is copied from Koop's `initServer` https://github.com/koopjs/koop-core/blob/41a5695a983f5c8b357a0edc472d010f61ca421c/index.js#L48
 *
 * TODO - consider unifying these (maybe export initServer from koop-core as a test helper?)
 */
export function createMockKoopApp(): express.Application {
  return express()
    .use(bodyParser.json({ limit: '10000kb' }))
    // parse application/x-www-form-urlencoded
    .use(bodyParser.urlencoded({ extended: false }))
    .disable('x-powered-by')
    .use(middleware.paramTrim)
    .use(middleware.paramParse)
    .use(middleware.paramCoerce)
    // for demos and preview maps in providers
    .set('view engine', 'ejs')
    .use(express.static(join(__dirname, '/public')))
    .use(cors());
}