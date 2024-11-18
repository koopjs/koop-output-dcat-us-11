import { compileDcatFeedEntry } from './compile-dcat-feed';
import { FeedFormatterStream } from './feed-formatter-stream';
import { TransformsList } from 'adlib';
import { HEADER_V3 } from './constants/contexts';

export function getDataStreamDcatUs11(feedTemplate: any, feedTemplateTransforms: TransformsList) {
  const footer = '\n\t]\n}';
  const { header: templateHeader, ...restFeedTemplate } = feedTemplate;

  const catalogStr = JSON.stringify({ ...HEADER_V3, ...templateHeader }, null, '\t');
  const header = `${catalogStr.substring(0, catalogStr.length - 2)},\n\t"dcat:dataset": [\n`;

  const formatFn = (chunk) => {
    return compileDcatFeedEntry(chunk, restFeedTemplate, feedTemplateTransforms);
  };

  return {
    stream: new FeedFormatterStream(header, footer, ',\n', formatFn)
  };
}
