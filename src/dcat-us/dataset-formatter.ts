import { RemoteServerError } from '@esri/hub-common';
import { adlib, TransformsList } from 'adlib';

export type DcatDatasetTemplate = Record<string, any>;

export function formatDcatDataset(hubDataset: any, feedTemplate: DcatDatasetTemplate, feedTemplateTransforms: TransformsList) {
  const defaultDataset = {
    '@type': 'dcat:Dataset'
  };

  try {
    const dcatDataset = Object.assign({}, defaultDataset, adlib(feedTemplate, hubDataset, feedTemplateTransforms));
    return indent(JSON.stringify({
      ...dcatDataset,
      distribution: dcatDataset.distribution && removeUninterpolatedDistributions(dcatDataset.distribution),
      theme: dcatDataset.spatial && ['geospatial']
    }, null, '\t'), 2);
  } catch (err) {
    throw new RemoteServerError(err?.message || 'Error parsing feed template', null, 400);
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