import * as _ from 'lodash';
import { adlib, TransformsList } from 'adlib';
import { isPage } from '@esri/hub-sites';
import { baseDatasetTemplate } from './base-dataset-template';
import { _generateDistributions } from './_generate-distributions';
import { cloneObject } from '@esri/hub-common';
import { IItem } from '@esri/arcgis-rest-portal';

// TODO - use real type for hubDataset when it gets defined in Hub.js
type HubDatasetAttributes = Record<string, any>;
type DcatDatasetTemplate = Record<string, any>;

export function formatDcatDataset (hubDataset: HubDatasetAttributes, siteUrl: string, dcatCustomizations: DcatDatasetTemplate = {}) {
  const landingPage = `${siteUrl}/datasets/${hubDataset.id}`;

  const template = dcatTemplate(dcatCustomizations);

  const { structuredLicense: { url = null } = {} } = hubDataset;

  const defaultDataset = {
    '@type': 'dcat:Dataset',
    identifier: landingPage,
    license: url,
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

  const dcatDataset = Object.assign({}, defaultDataset, adlib(template, hubDataset, transforms));

  if (isPage(hubDataset as IItem) && !hasTags(hubDataset)) {
    dcatDataset.keyword = ['ArcGIS Hub page'];
  }

  dcatDataset.distribution = _generateDistributions(hubDataset, landingPage);

  if (_.has(hubDataset, 'extent.coordinates')) {
    dcatDataset.spatial = hubDataset.extent.coordinates.join(',');

    // https://project-open-data.cio.gov/v1.1/schema/#theme
    // allow theme to be overrriden
    if (_.isEmpty(dcatCustomizations.theme)) {
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
  const scrubbedCustomizations = cloneObject(customizations);

  if (Object.keys(scrubbedCustomizations).length > 0) {
    delete scrubbedCustomizations['@type'];
    delete scrubbedCustomizations.identifier;
    delete scrubbedCustomizations.landingPage;
    delete scrubbedCustomizations.webService;
    if (scrubbedCustomizations.contactPoint) {
      delete scrubbedCustomizations.contactPoint['@type'];
    }
    delete scrubbedCustomizations.distributions;
  }

  return scrubbedCustomizations;
}

export function dcatTemplate (customizations: DcatDatasetTemplate): DcatDatasetTemplate {
  const customConfig = scrubProtectedKeys(customizations || {});
  return Object.assign({}, baseDatasetTemplate, customConfig);
}