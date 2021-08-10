import * as _ from 'lodash';
import { adlib, TransformsList } from 'adlib';
import { isPage } from '@esri/hub-sites';
import { baseTemplate } from './base-template';

export function formatDcatDataset (dataset: any, dcatCustomizations: any = {}) {
  const landingPage = 'undefined://undefined/datasets/00000000000000000000000000000000_0';

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

  dcatDataset.distribution = generateDistributions(dataset, landingPage);

  // only add spatial property if there's an extent
  if (dataset.extent && dataset.extent.coordinates) {
    dcatDataset.spatial = dataset.extent.coordinates.join(',');

    // https://project-open-data.cio.gov/v1.1/schema/#theme
    // allow theme to be overrriden
    if (_.isEmpty(dcatCustomizations.theme)) {
      dcatDataset.theme = ['geospatial'];
    }
  }

  return dcatDataset;
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

interface DistributionParameters {
  landingPage: string;
  serviceUrl: string;
  downloadLinkFor: (type: string) => string;
}

/*
* Generate DCAT Distributions
*/
function generateDistributions (dataset: any, landingPage: string) {
  const distributionFns = [
    getHubLandingPageDistribution,
    getEsriGeoServiceDistribution
  ];

  if (isLayer(dataset)) {
    distributionFns.push(getGeoJSONDistribution);
    distributionFns.push(getCSVDistribution);

    if (_.has(dataset, 'layer.geometryType')) {
      distributionFns.push(getKMLDistribution);
      distributionFns.push(getShapefileDistribution);
    }
  }

  if (dataset.supportedExtensions?.includes('WFSServer')) {
    distributionFns.push(getWFSDistribution);
  }

  if (dataset.supportedExtensions?.includes('WMSServer')) {
    distributionFns.push(getWMSDistribution);
  }

  const params: DistributionParameters = {
    landingPage,
    serviceUrl: dataset.url,
    downloadLinkFor: getDownloadLinkFn(landingPage, dataset)
  };

  const distributions = distributionFns.map(fn => fn(params));
  const customDistributions = getCustomDistributions(dataset);

  return [...distributions, ...customDistributions];
}

function isLayer (dataset: any) {
  return /_/.test(dataset.id);
}

// HUBJS CANDIDATE
function getDownloadLinkFn (landingPage: string, dataset: any) {
  const spatialReference = _.get(dataset, 'server.spatialReference');

  let queryStr = '';

  if (spatialReference) {
    const { latestWkid, wkid } = spatialReference;

    if (wkid) {
      const outSR = JSON.stringify({ latestWkid, wkid });
      queryStr = `?outSR=${encodeURIComponent(outSR)}`;
    }
  }

  return (ext: string) => `${landingPage}.${ext}${queryStr}`;
}

function getCustomDistributions (dataset: any) {
  const distros = [];
  const data = _.get(dataset, 'metadata.metadata.distInfo.distTranOps.onLineSrc');

  if (Array.isArray(data)) {
    for (const dist of data) {
      distros.push({
        '@type': 'dcat:Distribution',
        title: dist.orName || null,
        format: dist.protocol || null,
        accessURL: dist.linkage || null,
        description: dist.orDesc || null
      });
    }
  }

  return distros;
}

function ogcUrl (datasetUrl: string, type: 'WMS'|'WFS' = 'WMS') {
  return datasetUrl.replace(/rest\/services/i, 'services').replace(/\d+$/, `${type}Server?request=GetCapabilities&service=${type}`);
}

function getHubLandingPageDistribution(params: DistributionParameters) {
  return {
    '@type': 'dcat:Distribution',
    title: 'ArcGIS Hub Dataset',
    format: 'Web Page',
    mediaType: 'text/html',
    accessURL: params.landingPage
  };
}

function getEsriGeoServiceDistribution(params: DistributionParameters) {
  return {
    '@type': 'dcat:Distribution',
    title: 'ArcGIS GeoService',
    format: 'ArcGIS GeoServices REST API',
    mediaType: 'application/json',
    accessURL: params.serviceUrl
  };
}

function getGeoJSONDistribution (params: DistributionParameters) {
  return {
    '@type': 'dcat:Distribution',
    title: 'GeoJSON',
    format: 'GeoJSON',
    mediaType: 'application/vnd.geo+json',
    accessURL: params.downloadLinkFor('geojson')
  };
}
function getCSVDistribution (params: DistributionParameters) {
  return {
    '@type': 'dcat:Distribution',
    title: 'CSV',
    format: 'CSV',
    mediaType: 'text/csv',
    accessURL: params.downloadLinkFor('csv')
  };
}

function getKMLDistribution (params: DistributionParameters) {
  return {
    '@type': 'dcat:Distribution',
    title: 'KML',
    format: 'KML',
    mediaType: 'application/vnd.google-earth.kml+xml',
    accessURL: params.downloadLinkFor('kml')
  };
}

function getShapefileDistribution (params: DistributionParameters) {
  return {
    '@type': 'dcat:Distribution',
    title: 'Shapefile',
    format: 'ZIP',
    mediaType: 'application/zip',
    accessURL: params.downloadLinkFor('zip')
  };
}

function getWMSDistribution (params: DistributionParameters) {
  return {
    '@type': 'dcat:Distribution',
    title: 'OGC WMS',
    format: 'OGC WMS',
    mediaType: 'application/vnd.ogc.wms_xml',
    accessURL: ogcUrl(params.serviceUrl, 'WMS')
  };
}

function getWFSDistribution (params: DistributionParameters) {
  return {
    '@type': 'dcat:Distribution',
    title: 'OGC WMS',
    format: 'OGC WMS',
    mediaType: 'application/vnd.ogc.wms_xml',
    accessURL: ogcUrl(params.serviceUrl, 'WMS')
  };
}