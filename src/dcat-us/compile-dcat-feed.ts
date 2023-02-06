import { adlib, TransformsList } from 'adlib';
import * as _ from 'lodash';
import { DcatUsError } from './dcat-us-error';

export type DcatDatasetTemplate = Record<string, any>;

export function compileDcatFeedEntry(dataset: any, feedTemplate: DcatDatasetTemplate, feedTemplateTransforms: TransformsList) {
  try {
    const defaultDataset = {
      '@type': 'dcat:Dataset'
    };
    const dcatDataset = Object.assign({}, defaultDataset, adlib(feedTemplate, dataset, feedTemplateTransforms));

    return indent(JSON.stringify({
      ...dcatDataset,
      distribution: Array.isArray(dcatDataset.distribution) && removeUninterpolatedDistributions(_.flatten(dcatDataset.distribution)),
      theme: dcatDataset.spatial && ['geospatial']
    }, null, '\t'), 2);
  } catch (err) {
    throw new DcatUsError(err?.message || 'Error parsing feed template', 400);
  }
}

function removeUninterpolatedDistributions(distributions: any[]) {
  return distributions.filter((distro) => !(typeof distro === 'string' && distro.match(/{{.+}}/)?.length));
}

// HUBJS CANDIDATE
function indent(str: string, nTabs = 1) {
  const tabs = new Array(nTabs).fill('\t').join('');
  return tabs + str.replace(/\n/g, `\n${tabs}`);
}