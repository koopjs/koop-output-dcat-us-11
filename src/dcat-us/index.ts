import { compileDcatFeedEntry } from './compile-dcat-feed';
import { FeedFormatterStream } from './feed-formatter-stream';
import { TransformsList } from 'adlib';
import { HEADER_V_3_0, HEADER_V_1X } from './constants/contexts';

export function getDataStreamDcatUs(feedTemplate: any, feedTemplateTransforms: TransformsList, version: string) {
  const footer = '\n\t]\n}';
  let header: string;
  let template: Record<string, any>;

  if (version === '3.0') {
    const { header: templateHeader, ...restFeedTemplate } = feedTemplate;
    template = restFeedTemplate;
    header = generateDcatUs3XHeader(templateHeader);
  }

  if (version === '1.1') {
    template = feedTemplate;
    header = generateDcatUs1XHeader();
  }

  const formatFn = (chunk) => {
    return compileDcatFeedEntry(chunk, template, feedTemplateTransforms, version);
  };

  return {
    stream: new FeedFormatterStream(header, footer, ',\n', formatFn)
  };
}

function generateDcatUs1XHeader() {
  const catalogStr = JSON.stringify(HEADER_V_1X, null, '\t');
  return `${catalogStr.substring(
    0,
    catalogStr.length - 2,
  )},\n\t"dataset": [\n`;
}

function generateDcatUs3XHeader(header: Record<string, any>) {
  const catalogStr = JSON.stringify({ ...HEADER_V_3_0, ...header }, null, '\t');
  return `${catalogStr.substring(0, catalogStr.length - 2)},\n\t"dcat:dataset": [\n`;
}
