import { DatasetResource, datasetToItem, getProxyUrl, IHubRequestOptions } from '@esri/hub-common';
import * as _ from 'lodash';

const WFS_SERVER = 'WFSServer';
const WMS_SERVER = 'WMSServer';

export const DISTRIBUTION_DEPENDENCIES = [
  'layer.geometryType',
  'server.spatialReference',
  'metadata.metadata.distInfo.distTranOps.onLineSrc',
  'url',
];

interface IGenerateDistributionParams {
  hubDataset: Record<any, any>; // dataset from the Hub API
  dcatDataset: Record<any, any>; // interpolated dataset from adlib
  landingPage: string; // best guess at the canonical Hub URL for the dataset
  downloadLink: string; // Hub download url for the dataset
}

/**
 * Generates distributions for a given dataset.
 * 
 * A note about custom distributions. We now allow clients to define custom
 * distributions on their DCAT Config objects via the `distribution` property. 
 * 
 * We will prepend the interpolated value of `distribution` onto the result if
 * the value is an array. If the value not an array, it will be ignored.
 * 
 * @param {IGenerateDistributionParams} params 
 * @returns all distributions
 */
export function _generateDistributions(params: IGenerateDistributionParams) {
  const {
    hubDataset, 
    dcatDataset,
    landingPage, 
    downloadLink
  } = params;

  const customDistributions = _.isArray(dcatDataset.distribution) ? dcatDataset.distribution : [];
  const standardDistributions = _generateStandardDistributions(hubDataset, landingPage, downloadLink);

  return [...customDistributions, ...standardDistributions];
}

/*
* Generate Standard DCAT Distributions
*/
function _generateStandardDistributions (hubDataset: Record<any, any>, landingPage: string, downloadLink: string) {

  const distributionFns = [
    getHubLandingPageDistribution,
    getEsriGeoServiceDistribution
  ];

  if (isProxiedCSV(hubDataset)) {
    distributionFns.push(getCSVDistribution);
  }

  if (isLayer(hubDataset)) {
    distributionFns.push(getGeoJSONDistribution);
    distributionFns.push(getCSVDistribution);

    if (_.has(hubDataset, 'layer.geometryType')) {
      distributionFns.push(getKMLDistribution);
      distributionFns.push(getShapefileDistribution);
    }
  }

  if (hubDataset.supportedExtensions?.includes(WFS_SERVER)) {
    distributionFns.push(getWFSDistribution);
  }

  if (hubDataset.supportedExtensions?.includes(WMS_SERVER)) {
    distributionFns.push(getWMSDistribution);
  }

  const params: DistributionParameters = {
    landingPage,
    downloadLink,
    serviceUrl: hubDataset.url,
    downloadLinkFor: getDownloadLinkFn(downloadLink, hubDataset)
  };

  const distributions = distributionFns.map(fn => fn(params));
  const metadataDistributions = getMetadataDistributions(hubDataset);

  return [...distributions, ...metadataDistributions];
}

function isLayer (hubDataset: any) {
  return /_/.test(hubDataset.id);
}

function isProxiedCSV(hubDataset: any) {
  const item = datasetToItem({
    id: hubDataset.id,
    attributes: hubDataset
  } as DatasetResource);
  const requestOptions: IHubRequestOptions = { isPortal: false };
  
  return !!getProxyUrl(item, requestOptions);
}

// HUBJS CANDIDATE
function getDownloadLinkFn (downloadLink: string, hubDataset: any) {
  const spatialReference = _.get(hubDataset, 'server.spatialReference');

  let queryStr = '';

  if (spatialReference) {
    const { latestWkid, wkid } = spatialReference;

    if (wkid) {
      const outSR = JSON.stringify({ latestWkid, wkid });
      queryStr = `?outSR=${encodeURIComponent(outSR)}`;
    }
  }

  return (ext: string) => `${downloadLink}.${ext}${queryStr}`;
}

function getMetadataDistributions (hubDataset: any) {
  const distros = [];
  const data = _.get(hubDataset, 'metadata.metadata.distInfo.distTranOps.onLineSrc');

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

interface DistributionParameters {
  landingPage: string;
  downloadLink: string;
  serviceUrl: string;
  downloadLinkFor: (type: string) => string;
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
    title: 'OGC WFS',
    format: 'OGC WFS',
    mediaType: 'application/vnd.ogc.wfs_xml',
    accessURL: ogcUrl(params.serviceUrl, 'WFS')
  };
}