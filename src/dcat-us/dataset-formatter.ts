import { adlib, TransformsList } from 'adlib';

export type DcatDatasetTemplate = Record<string, any>;

export function formatDcatDataset(hubDataset: any, feedTemplate: DcatDatasetTemplate, feedTemplateTransforms: TransformsList) {
  const defaultDataset = {
    '@type': 'dcat:Dataset'
  };

  const dcatDataset = Object.assign({}, defaultDataset, adlib(feedTemplate, hubDataset, feedTemplateTransforms));

  if (dcatDataset.distribution) {
    dcatDataset.distribution = removeUninterpolatedDistributions(dcatDataset.distribution);
  }

  if (dcatDataset.spatial) {
    dcatDataset.theme = ['geospatial'];
  }

  return indent(JSON.stringify({
    ...dcatDataset,
    distribution: removeUninterpolatedDistributions(dcatDataset.distribution)
  }, null, '\t'), 2);
}

function removeUninterpolatedDistributions(distributions: any[]) {
  return distributions.filter((distro) => !(typeof distro === 'string' && distro.match(/{{.+}}/)?.length));
}

// HUBJS CANDIDATE
function indent(str: string, nTabs = 1) {
  const tabs = new Array(nTabs).fill('\t').join('');
  return tabs + str.replace(/\n/g, `\n${tabs}`);
}