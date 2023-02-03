import { compileDcatFeedEntry } from './compile-dcat-feed';
import { FeedFormatterStream } from './feed-formatter-stream';
import { TransformsList } from 'adlib';

export function getDataStreamDcatUs11(feedTemplate: any, feedTemplateTransforms: TransformsList) {
  const catalogStr = JSON.stringify({
    '@context':
      'https://project-open-data.cio.gov/v1.1/schema/catalog.jsonld',
    '@type': 'dcat:Catalog',
    conformsTo: 'https://project-open-data.cio.gov/v1.1/schema',
    describedBy: 'https://project-open-data.cio.gov/v1.1/schema/catalog.json',
  }, null, '\t');

  const header = `${catalogStr.substr(
    0,
    catalogStr.length - 2,
  )},\n\t"dataset": [\n`;

  const footer = '\n\t]\n}';

  const formatFn = (chunk) => {
    return compileDcatFeedEntry(chunk, feedTemplate, feedTemplateTransforms);
  };

  return {
    stream: new FeedFormatterStream(header, footer, ',\n', formatFn)
  };
}