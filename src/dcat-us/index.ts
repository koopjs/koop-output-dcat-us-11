import { compileDcatFeedEntry } from './compile-dcat-feed';
import { FeedFormatterStream } from './feed-formatter-stream';
import { TransformsList } from 'adlib';
import { HEADER_V_3, HEADER_V_1_1 } from './constants/contexts';

export function getDataStreamDcatUs(feedTemplate: any, feedTemplateTransforms: TransformsList, version: string) {
  const footer = '\n\t]\n}';
  let header: string;
  let template: Record<string, any>;
  
  if (version === '3.0') {
    const { header: templateHeader, ...restFeedTemplate } = feedTemplate;
    template = restFeedTemplate;
    const catalogStr = JSON.stringify({ ...HEADER_V_3, ...templateHeader }, null, '\t');
    header = `${catalogStr.substring(0, catalogStr.length - 2)},\n\t"dcat:dataset": [\n`;
  }

  if (version === '1.1') {
    const catalogStr = JSON.stringify(HEADER_V_1_1, null, '\t');
    header = `${catalogStr.substring(
      0,
      catalogStr.length - 2,
    )},\n\t"dataset": [\n`;
    template = feedTemplate;
  }

  const formatFn = (chunk) => {
    return compileDcatFeedEntry(chunk, template, feedTemplateTransforms, version);
  };

  return {
    stream: new FeedFormatterStream(header, footer, ',\n', formatFn)
  };
}
