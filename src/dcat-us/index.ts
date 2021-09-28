import { IItem } from '@esri/arcgis-rest-portal';
import { DcatDatasetTemplate, formatDcatDataset } from './dataset-formatter';
import { FeedFormatterStream } from './feed-formatter-stream';

export function getDataStreamDcatUs11(siteItem: IItem, dcatCustomizations?: DcatDatasetTemplate) {
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
    return formatDcatDataset(chunk, siteItem.url, dcatCustomizations);
  };

  return new FeedFormatterStream(header, footer, ',\n', formatFn);
}
