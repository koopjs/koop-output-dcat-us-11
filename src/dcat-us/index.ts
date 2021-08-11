import { IItem } from '@esri/arcgis-rest-portal';
import { FeedFormatterStream } from './feed-formatter-stream';

export function getDataStreamDcatUs11(siteItem: IItem) {
  console.log(siteItem);

  const header = `{
    "@context":"https://project-open-data.cio.gov/v1.1/schema/catalog.jsonld",
    "@type":"dcat:Catalog",
    "conformsTo":"https://project-open-data.cio.gov/v1.1/schema",
    "describedBy":"https://project-open-data.cio.gov/v1.1/schema/catalog.json",
    "dataset":[`;

  const footer = ']}';

  const formatFn = (chunk) => {
    return JSON.stringify(chunk);
  };

  return new FeedFormatterStream(header, footer, '', formatFn);
}
