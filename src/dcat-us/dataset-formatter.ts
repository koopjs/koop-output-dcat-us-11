import * as _ from 'lodash';
import { adlib, TransformsList } from 'adlib';
import { isPage } from '@esri/hub-sites';
import { baseDatasetTemplate } from './base-dataset-template';
import { _generateDistributions } from './_generate-distributions';
import { cloneObject, DatasetResource, datasetToContent, getContentSiteUrls, IModel } from '@esri/hub-common';
import { IItem } from '@esri/arcgis-rest-portal';
import { nonEditableFieldPaths } from './noneditable-fields';

// TODO - use real type for hubDataset when it gets defined in Hub.js
type HubDatasetAttributes = Record<string, any>;
export type DcatDatasetTemplate = Record<string, any>;

export function formatDcatDataset (hubDataset: HubDatasetAttributes, siteUrl: string, siteModel: IModel, datasetTemplate: DcatDatasetTemplate) {
  const content = datasetToContent({ 
    id: hubDataset.id, 
    attributes: hubDataset
  } as DatasetResource);
  const { relative: relativePath } = getContentSiteUrls(content, siteModel);
  const landingPage = siteUrl.startsWith('https://') ? siteUrl + relativePath : `https://${siteUrl}${relativePath}`;
  const downloadLink = siteUrl.startsWith('https://') ? `${siteUrl}/datasets/${content.identifier}` : `https://${siteUrl}/datasets/${content.identifier}`;

  const { 
    structuredLicense: { url = null } = {},
    licenseInfo = ''
  } = hubDataset;

  // Override hub.js default license value of 'none'
  if (hubDataset.license === 'none') {
    hubDataset.license = null;
  }

  const defaultDataset = {
    '@type': 'dcat:Dataset',
    identifier: landingPage,
    landingPage
  };

  const transforms: TransformsList = {
    toISO (_key, val) {
      return new Date(val).toISOString();
    },
    toArray (_key, val) {
      if (!val) return [];
      else return _.castArray(val);
    }
  };

  const dcatDataset = Object.assign({}, defaultDataset, adlib(datasetTemplate, hubDataset, transforms));

  setLeftoverInterpolations(dcatDataset);

  if (!dcatDataset.license || dcatDataset.license.match(/{{.+}}/g)?.length) {
    dcatDataset.license = url || licenseInfo || '';
  }

  if (isPage(hubDataset as IItem) && !hasTags(hubDataset)) {
    dcatDataset.keyword = ['ArcGIS Hub page'];
  }

  dcatDataset.distribution = _generateDistributions(hubDataset, landingPage, downloadLink);

  if (_.has(hubDataset, 'extent.coordinates')) {
    dcatDataset.spatial = hubDataset.extent.coordinates.join(',');

    // https://project-open-data.cio.gov/v1.1/schema/#theme
    // allow theme to be overridden
    if (_.isEmpty(datasetTemplate.theme)) {
      dcatDataset.theme = ['geospatial'];
    }
  }

  return indent(JSON.stringify(dcatDataset, null, '\t'), 2);
}

// HUBJS CANDIDATE
function indent(str: string, nTabs = 1) {
  const tabs = new Array(nTabs).fill('\t').join('');
  return tabs + str.replace(/\n/g, `\n${tabs}`);
}

function hasTags (hubDataset: HubDatasetAttributes) {
  const maybeTags = hubDataset.tags;
  return !!maybeTags && !(/{{.+}}/.test(maybeTags) || maybeTags.length === 0 || maybeTags[0] === '');
}

function scrubProtectedKeys (customizations: DcatDatasetTemplate): DcatDatasetTemplate {
  const scrubbedCustomizations = _.omit(cloneObject(customizations), nonEditableFieldPaths) as DcatDatasetTemplate;

  if (scrubbedCustomizations.contactPoint) {
    scrubbedCustomizations.contactPoint['@type'] = 'vcard:Contact';
  }

  return scrubbedCustomizations;
}

export function buildDatasetTemplate (customizations: DcatDatasetTemplate = {}): DcatDatasetTemplate {
  const customConfig = scrubProtectedKeys(customizations);
  return Object.assign({}, baseDatasetTemplate, customConfig);
}

function setLeftoverInterpolations(dataset) {
  nonEditableFieldPaths.forEach(path => {
    const value = _.get(dataset, path, '');
    if (typeof value === 'string' && value.match(/{{.+}}/)?.length) {
      _.set(dataset, path, '');
    }
  });
}