import { IModel } from '@esri/hub-common';
import { listDependencies } from 'adlib';
import { buildDatasetTemplate, DcatDatasetTemplate, formatDcatDataset } from './dataset-formatter';
import { FeedFormatterStream } from './feed-formatter-stream';
import { DISTRIBUTION_DEPENDENCIES } from './_generate-distributions';

export function getDataStreamDcatUs11(siteUrl: string, siteModel: IModel, dcatCustomizations?: DcatDatasetTemplate) {
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

  const datasetTemplate = buildDatasetTemplate(dcatCustomizations);

  const formatFn = (chunk) => {
    return formatDcatDataset(chunk, siteUrl, siteModel, datasetTemplate);
  };

  return {
    stream: new FeedFormatterStream(header, footer, ',\n', formatFn),
    dependencies: [
      'id', // used for the dataset landing page URL
      'type', // used for the dataset landing page URL
      'slug', // used for the dataset landing page URL
      'access', // used for detecting proxied csv's
      'size', // used for detecting proxied csv's
      'licenseInfo', // required for license resolution
      'structuredLicense', // required for license resolution
      ...DISTRIBUTION_DEPENDENCIES,
      ...listDependencies(datasetTemplate)
    ]
  };
}
