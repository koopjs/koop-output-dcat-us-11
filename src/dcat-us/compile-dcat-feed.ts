import { adlib, TransformsList } from 'adlib';
import * as _ from 'lodash';
import { DcatUsError } from './dcat-us-error';

export type DcatDatasetTemplate = Record<string, any>;

export function compileDcatFeedEntry(geojsonFeature: any, feedTemplate: DcatDatasetTemplate, feedTemplateTransforms: TransformsList) {
  try {
    const dcatFeedItem = generateDcatItem(feedTemplate, feedTemplateTransforms, geojsonFeature);

    return indent(JSON.stringify({
      ...dcatFeedItem,
      distribution: Array.isArray(dcatFeedItem.distribution) && removeUninterpolatedDistributions(_.flatten(dcatFeedItem.distribution)),
      theme: dcatFeedItem.spatial && ['geospatial']
    }, null, '\t'), 2);
  } catch (err) {
    throw new DcatUsError(err?.message || 'Error parsing feed template', 400);
  }
}

function removeUninterpolatedDistributions(distributions: any[]) {
  return distributions.filter((distro) => !(typeof distro === 'string' && distro.match(/{{.+}}/)?.length));
}

function generateDcatItem(feedTemplate, feedTemplateTransforms, geojsonFeature) {
  const defaultFields = {
    '@type': 'dcat:Dataset'
  };
  //
  const dcatFeedData = { 
    ...geojsonFeature?.properties, 
    ...{ geometry: geojsonFeature?.geometry } 
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
function indent(str: string, nTabs = 1) {
  const tabs = new Array(nTabs).fill('\t').join('');
  return tabs + str.replace(/\n/g, `\n${tabs}`);
}