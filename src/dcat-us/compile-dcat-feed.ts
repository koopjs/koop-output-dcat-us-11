import { adlib, TransformsList } from 'adlib';

export type DcatDatasetTemplate = Record<string, any>;

export function compileDcatFeedEntry(feedData: any, feedTemplate: DcatDatasetTemplate, feedTemplateTransforms: TransformsList) {
  try {
    const defaultDataset = {
      '@type': 'dcat:Dataset'
    };
    const dcatDataset = Object.assign({}, defaultDataset, adlib(feedTemplate, feedData, feedTemplateTransforms));

    return indent(JSON.stringify({
      ...dcatDataset,
      distribution: dcatDataset.distribution && removeUninterpolatedDistributions(dcatDataset.distribution),
      theme: dcatDataset.spatial && ['geospatial']
    }, null, '\t'), 2);
  } catch (err) {
    throw getDcatErrorWithStatusCode(err?.message || 'Error parsing feed template', 400);
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

interface DcatUsError extends Error {
  statusCode: number
}
export function getDcatErrorWithStatusCode(message: string, statusCode: number) {
  return {
    statusCode,
    message
  } as DcatUsError;
}