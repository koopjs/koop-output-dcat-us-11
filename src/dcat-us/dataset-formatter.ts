import * as _ from 'lodash';
import { adlib, TransformsList } from 'adlib';
import { isPage } from '@esri/hub-sites';
import { baseDatasetTemplate } from './base-dataset-template';
import { _generateDistributions } from './_generate-distributions';
import { cloneObject, DatasetResource, datasetToContent, getContentSiteUrls, IModel, isBBox, parseDatasetId } from '@esri/hub-common';
import { IItem } from '@esri/arcgis-rest-portal';
import { nonEditableFieldPaths } from './noneditable-fields';
import { portalUrl } from '../config';

// TODO - use real type for hubDataset when it gets defined in Hub.js
type HubDatasetAttributes = Record<string, any>;
export type DcatDatasetTemplate = Record<string, any>;

export function formatDcatDataset (hubDataset: HubDatasetAttributes, siteUrl: string, siteModel: IModel, datasetTemplate: DcatDatasetTemplate) {
  // Download and Hub Links must be generated from Content
  const content = datasetToContent({ 
    id: hubDataset.id, 
    attributes: hubDataset
  } as DatasetResource);
  const { relative: relativePath } = getContentSiteUrls(content, siteModel);
  const hubLandingPage = siteUrl.startsWith('https://') ? siteUrl + relativePath : `https://${siteUrl}${relativePath}`;
  const downloadLink = siteUrl.startsWith('https://') ? `${siteUrl}/datasets/${content.identifier}` : `https://${siteUrl}/datasets/${content.identifier}`;

  // AGO links must be generated from Dataset Records
  const { itemId, layerId } = parseDatasetId(hubDataset.id);
  let agoLandingPage = `${portalUrl}/home/item.html?id=${itemId}`;
  if (layerId) {
    agoLandingPage += `&sublayer=${layerId}`;
  }

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
    identifier: agoLandingPage,
    landingPage: hubLandingPage
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

  // reset uninterpolated, non-editable fields since customers cannot remove them
  resetUninterpolatedPaths(dcatDataset, nonEditableFieldPaths);

  if (!dcatDataset.license || dcatDataset.license.match(/{{.+}}/g)?.length) {
    dcatDataset.license = url || licenseInfo || '';
  }

  if (isPage(hubDataset as IItem) && !hasTags(hubDataset)) {
    dcatDataset.keyword = ['ArcGIS Hub page'];
  }

  dcatDataset.distribution = _generateDistributions({
    hubDataset, 
    dcatDataset,
    landingPage: hubLandingPage, 
    downloadLink
  });

  const spatial = computeSpatialProperty(datasetTemplate, dcatDataset);
  if (spatial) {
    dcatDataset.spatial = spatial;

    // https://project-open-data.cio.gov/v1.1/schema/#theme
    // allow theme to be overridden
    if (_.isEmpty(datasetTemplate.theme)) {
      dcatDataset.theme = ['geospatial'];
    }
  } else if (dcatDataset.spatial) {
    delete dcatDataset.spatial;
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

/**
 * Determines what to put in the spatial property based on template, raw dataset, and adlib-ed dataset
 */
function computeSpatialProperty(datasetTemplate, dcatDataset) {
  // Either the template does not have spatial key set or somehow adlib does not inject, so don't set
  if (!datasetTemplate.spatial || !dcatDataset.spatial) return undefined;

  // Adlib returns the input for a templated value when it cannot resolve a non-falsey value
  if (typeof dcatDataset.spatial === 'string' && dcatDataset.spatial.match(/{{.+}}/)?.length) return undefined;

  // Get coordinates from valid GeoJSON bbox envelope or raw coordinates
  let coordinates;
  if (dcatDataset.spatial.type === 'envelope' && Array.isArray(dcatDataset.spatial.coordinates)) {
    coordinates = dcatDataset.spatial.coordinates;
  } else if (Array.isArray(dcatDataset.spatial)) {
    coordinates = dcatDataset.spatial;
  }

  // Just return what adlib returned if coordinates cannot be obtained
  if (!coordinates) return dcatDataset.spatial;

  // If valid bbox coordinates return stringified
  if (!isBBox(coordinates)) return undefined;
  if (coordinates.length != 2 || coordinates[0].length != 2 || coordinates[1].length != 2) {
    return undefined;
  }
  if (!_.isNumber(coordinates[0][0]) || !_.isNumber(coordinates[0][1]) || !_.isNumber(coordinates[1][0]) || !_.isNumber(coordinates[1][1])) {
    return undefined;
  }
  return `${coordinates[0][0].toFixed(4)},${coordinates[0][1].toFixed(4)},${coordinates[1][0].toFixed(4)},${coordinates[1][1].toFixed(4)}`;
}