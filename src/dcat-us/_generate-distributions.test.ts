import { _generateDistributions } from './_generate-distributions';

describe('_generateDistributions', () => {
  const serviceUrl = 'https://servicesqa.arcgis.com/Xj56SBi2udA78cC9/arcgis/rest/services/Tahoe_Things/FeatureServer/0';
  const getLandingPage = (id: string) => `https://my-site.hub.arcgis.com/maps/${id}`;
  const getDownloadLink = (id: string) => `https://my-site.hub.arcgis.com/datasets/${id}`;

  it('add default distributions if dataset is a collection', () => {
    const dataset = {
      id: 'foo', // non-layer id
      url: serviceUrl
    };

    const expected =  [{
      '@type': 'dcat:Distribution',
      title: 'ArcGIS Hub Dataset',
      format: 'Web Page',
      mediaType: 'text/html',
      accessURL: 'https://my-site.hub.arcgis.com/maps/foo'
    },
    {
      '@type': 'dcat:Distribution',
      title: 'ArcGIS GeoService',
      format: 'ArcGIS GeoServices REST API',
      mediaType: 'application/json',
      accessURL: 'https://servicesqa.arcgis.com/Xj56SBi2udA78cC9/arcgis/rest/services/Tahoe_Things/FeatureServer/0'
    },
  ]

    const distributions = _generateDistributions(dataset, getLandingPage(dataset.id), getDownloadLink(dataset.id));

    expect(distributions.length).toBe(2)
    expect(distributions).toEqual(expected);
  })

  it('adds default and csv distributions if dataset is a proxied csv', () => {
    const dataset = {
      id: 'foo',
      access: 'public',
      slug: 'nissan::skyline-gtr',
      size: 1,
      type: 'CSV'
    };

    const expected =  [{
      '@type': 'dcat:Distribution',
      title: 'ArcGIS Hub Dataset',
      format: 'Web Page',
      mediaType: 'text/html',
      accessURL: 'https://my-site.hub.arcgis.com/maps/nissan::skyline-gtr'
    },
    {
      '@type': 'dcat:Distribution',
      title: 'ArcGIS GeoService',
      format: 'ArcGIS GeoServices REST API',
      mediaType: 'application/json',
    },
    {
      '@type': 'dcat:Distribution',
      title: 'CSV',
      format: 'CSV',
      mediaType: 'text/csv',
      accessURL: 'https://my-site.hub.arcgis.com/datasets/nissan::skyline-gtr.csv'
    }
  ]

    const distributions = _generateDistributions(dataset, getLandingPage(dataset.slug), getDownloadLink(dataset.slug));

    expect(distributions.length).toBe(3)
    expect(distributions).toEqual(expected);
  });

  it('adds default distributions if dataset is a layer', () => {
    const dataset = {
      id: 'foo_0', // layer id
      url: serviceUrl
    };

    const expected =  [{
      '@type': 'dcat:Distribution',
      title: 'ArcGIS Hub Dataset',
      format: 'Web Page',
      mediaType: 'text/html',
      accessURL: 'https://my-site.hub.arcgis.com/maps/foo_0'
    },
    {
      '@type': 'dcat:Distribution',
      title: 'ArcGIS GeoService',
      format: 'ArcGIS GeoServices REST API',
      mediaType: 'application/json',
      accessURL: 'https://servicesqa.arcgis.com/Xj56SBi2udA78cC9/arcgis/rest/services/Tahoe_Things/FeatureServer/0'
    },
    {
      '@type': 'dcat:Distribution',
      title: 'GeoJSON',
      format: 'GeoJSON',
      mediaType: 'application/vnd.geo+json',
      accessURL: 'https://my-site.hub.arcgis.com/datasets/foo_0.geojson'
    },
    {
      '@type': 'dcat:Distribution',
      title: 'CSV',
      format: 'CSV',
      mediaType: 'text/csv',
      accessURL: 'https://my-site.hub.arcgis.com/datasets/foo_0.csv'
    }
  ]

    const distributions = _generateDistributions(dataset, getLandingPage(dataset.id), getDownloadLink(dataset.id));

    expect(distributions.length).toBe(4)
    expect(distributions).toEqual(expected);
  });

  it('adds KML and Shapefile if dataset is a layer AND has geometryType', () => {
    const dataset = {
      id: 'foo_0', // layer id
      url: serviceUrl,
      layer: {
        geometryType: 'some thing'
      }
    };

    const expected =  [{
      '@type': 'dcat:Distribution',
      title: 'KML',
      format: 'KML',
      mediaType: 'application/vnd.google-earth.kml+xml',
      accessURL: 'https://my-site.hub.arcgis.com/datasets/foo_0.kml'
    },
    {
      '@type': 'dcat:Distribution',
      title: 'Shapefile',
      format: 'ZIP',
      mediaType: 'application/zip',
      accessURL: 'https://my-site.hub.arcgis.com/datasets/foo_0.zip'
    }
  ]

    const distributions = _generateDistributions(dataset, getLandingPage(dataset.id), getDownloadLink(dataset.id));

    expect(distributions.length).toBe(6)
    expect(distributions.slice(4)).toEqual(expected);
  });

  it('adds WFS and WMS if supported', () => {
    const dataset = {
      id: 'foo', // non-layer id
      url: serviceUrl
    };

    const expectedWMSDistribution = {
      '@type': 'dcat:Distribution',
      title: 'OGC WMS',
      format: 'OGC WMS',
      mediaType: 'application/vnd.ogc.wms_xml',
      accessURL: 'https://servicesqa.arcgis.com/Xj56SBi2udA78cC9/arcgis/services/Tahoe_Things/FeatureServer/WMSServer?request=GetCapabilities&service=WMS'
    };

    const expectedWFSDistribution = {
      '@type': 'dcat:Distribution',
      title: 'OGC WFS',
      format: 'OGC WFS',
      mediaType: 'application/vnd.ogc.wfs_xml',
      accessURL: 'https://servicesqa.arcgis.com/Xj56SBi2udA78cC9/arcgis/services/Tahoe_Things/FeatureServer/WFSServer?request=GetCapabilities&service=WFS'
    };

    const justWFS = _generateDistributions({ ...dataset, supportedExtensions: 'WFSServer' }, getLandingPage(dataset.id), getDownloadLink(dataset.id));
    expect(justWFS.length).toBe(3);
    expect(justWFS.pop()).toEqual(expectedWFSDistribution);

    const justWMS = _generateDistributions({ ...dataset, supportedExtensions: 'WMSServer' }, getLandingPage(dataset.id), getDownloadLink(dataset.id));
    expect(justWMS.length).toBe(3);
    expect(justWMS.pop()).toEqual(expectedWMSDistribution);

    const allOGCServices = _generateDistributions({ ...dataset, supportedExtensions: 'WMSServer,WFSServer' }, getLandingPage(dataset.id), getDownloadLink(dataset.id));
    expect(allOGCServices.length).toBe(4);
    expect(allOGCServices.slice(2)).toEqual([expectedWFSDistribution, expectedWMSDistribution]);
  });

  it('adds custom distributions from metadata', () => {
    const dataset = {
      id: 'foo', // non-layer id
      url: serviceUrl,
      metadata: {
        metadata: {
          distInfo: {
            distTranOps: {
              onLineSrc: [
                {
                  orName: 'Title 1',
                  protocol: 'TTL',
                  linkage: 'https://some-url.com',
                  orDesc: 'Fun Description'
                },
                {
                  orName: 'Title 2',
                  // no protocol
                  linkage: 'https://some-url.com',
                  // no description
                }
              ]
            }
          }
        }
      }
    };

    const distributions = _generateDistributions(dataset, getLandingPage(dataset.id), getDownloadLink(dataset.id));

    expect(distributions.length).toBe(4);
    expect(distributions.slice(2)).toEqual([
      {
        '@type': 'dcat:Distribution',
        title: 'Title 1',
        format: 'TTL',
        accessURL: 'https://some-url.com',
        description: 'Fun Description'
      },
      {
        '@type': 'dcat:Distribution',
        title: 'Title 2',
        format: null,
        accessURL: 'https://some-url.com',
        description: null
      }
    ])
  });
});