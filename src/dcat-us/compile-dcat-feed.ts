import { adlib, TransformsList } from 'adlib';
import * as _ from 'lodash';
import { DcatUsError } from './dcat-us-error';

export type DcatDatasetTemplate = Record<string, any>;
type Feature = {
  type: string,
  geometry: Record<string, any>,
  properties: Record<string, any>
};

export function compileDcatFeedEntry(geojsonFeature: Feature | undefined, feedTemplate: DcatDatasetTemplate, feedTemplateTransforms: TransformsList): string {
  try {
    const dcatFeedItem = generateDcatItem(feedTemplate, feedTemplateTransforms, geojsonFeature);
    return indent(JSON.stringify({
      ...dcatFeedItem,
      'dcat:distribution': 
        Array.isArray(dcatFeedItem['dcat:distribution']) && 
        removeUninterpolatedDistributions(_.flatten(dcatFeedItem['dcat:distribution'])),
    }, null, '\t'), 2);
  } catch (err) {
    throw new DcatUsError(err.message, 400);
  }
}

function removeUninterpolatedDistributions(distributions: any[]) {
  return distributions.filter((distro) => !(typeof distro === 'string' && distro.match(/{{.+}}/)?.length));
}

function generateDcatItem(feedTemplate: DcatDatasetTemplate, feedTemplateTransforms: TransformsList, geojsonFeature: Feature): Record<string, any> {
  const defaultFields = {
    '@type': 'dcat:Dataset'
  };

  const dcatFeedData = {
    ...geojsonFeature.properties,
    geometry: geojsonFeature.geometry
  };

  const interpolatedFields = adlib(
    feedTemplate,
    dcatFeedData,
    feedTemplateTransforms
  );

  return Object.assign(
    {},
    defaultFields,
    interpolatedFields
  );
}

// HUBJS CANDIDATE
function indent(str: string, nTabs: number) {
  const tabs = new Array(nTabs).fill('\t').join('');
  return tabs + str.replace(/\n/g, `\n${tabs}`);
}