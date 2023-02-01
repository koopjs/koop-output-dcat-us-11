import { adlib, TransformsList } from 'adlib';
import * as _ from 'lodash';

export type DcatDatasetTemplate = Record<string, any>;

export function formatDcatDataset(hubDataset: any, datasetTemplate: DcatDatasetTemplate, transforms: TransformsList, nonEditableFieldPaths: string[]) {

  const defaultDataset = {
    '@type': 'dcat:Dataset'
  };

  const dcatDataset = Object.assign({}, defaultDataset, adlib(datasetTemplate, hubDataset, transforms));

  // reset uninterpolated, non-editable fields since customers cannot remove them
  resetUninterpolatedPaths(dcatDataset, nonEditableFieldPaths);
  if (dcatDataset.distribution) {
    dcatDataset.distribution = removeUninterpolatedDistributions(dcatDataset.distribution);
  }

  return indent(JSON.stringify(dcatDataset, null, '\t'), 2);
}

function removeUninterpolatedDistributions(distributions: any[]) {
  return distributions.filter((distro) => !(typeof distro === 'string' && distro.match(/{{.+}}/)?.length));
}

// HUBJS CANDIDATE
function indent(str: string, nTabs = 1) {
  const tabs = new Array(nTabs).fill('\t').join('');
  return tabs + str.replace(/\n/g, `\n${tabs}`);
}

/**
 * If the value at each field path is an uninterpolated adlib string,
 * change the field to the empty string.
 */
function resetUninterpolatedPaths(dataset, fieldPaths) {
  fieldPaths.forEach(path => {
    const value = _.get(dataset, path, '');
    if (typeof value === 'string' && value.match(/{{.+}}/)?.length) {
      _.set(dataset, path, '');
    }
  });
}