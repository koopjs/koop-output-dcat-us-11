import * as _ from 'lodash';
import { adlib, TransformsList } from 'adlib';
import { isPage } from '@esri/hub-sites';
import { baseTemplate } from './base-template';
import { _generateDistributions } from './_generate-distributions';

export function formatDcatDataset (dataset: any, siteUrl: string, dcatCustomizations: any = {}) {
  const landingPage = `${siteUrl}/datasets/${dataset.id}`;

  const template = dcatTemplate(dcatCustomizations);

  const { structuredLicense: { text = '' } = {}, licenseInfo } = dataset;

  const defaultDataset = {
    '@type': 'dcat:Dataset',
    identifier: landingPage,
    license: text || licenseInfo || 'No license provided. Request permission to use.',
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

  const dcatDataset = Object.assign({}, defaultDataset, adlib(template, dataset, transforms));

  const hasNoTags = /{{.+}}/.test(dcatDataset.keyword)
    || dcatDataset.keyword.length === 0
    || !dcatDataset.keyword[0]; // if tags is undefined, the tags array is empty, or tags is an empty string

  if (isPage(dataset) && hasNoTags) {
    dcatDataset.keyword = ['ArcGIS Hub page'];
  }

  dcatDataset.distribution = _generateDistributions(dataset, landingPage);

  // only add spatial property if there's an extent
  if (dataset.extent && dataset.extent.coordinates) {
    dcatDataset.spatial = dataset.extent.coordinates.join(',');

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

// remove customizations that attempt to overwrite special or required fields
function scrub (customizations: any) {
  if (Object.keys(customizations).length > 0) {
    delete customizations['@type'];
    delete customizations.identifier;
    delete customizations.landingPage;
    delete customizations.webService;
    if (customizations.contactPoint) {
      delete customizations.contactPoint['@type'];
    }
    delete customizations.distributions;
  }

  return customizations;
}

export function dcatTemplate (customizations: any) {
  const customConfig = scrub(customizations || {});
  return Object.assign({}, baseTemplate, customConfig);
}