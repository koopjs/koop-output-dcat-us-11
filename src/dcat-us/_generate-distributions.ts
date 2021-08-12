import * as _ from 'lodash';

const WFS_SERVER = 'WFSServer';
const WMS_SERVER = 'WMSServer';

/*
* Generate DCAT Distributions
*/
export function _generateDistributions (dataset: any, landingPage: string) {
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

  if (dataset.supportedExtensions?.includes(WFS_SERVER)) {
    distributionFns.push(getWFSDistribution);
  }

  if (dataset.supportedExtensions?.includes(WMS_SERVER)) {
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

interface DistributionParameters {
  landingPage: string;
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