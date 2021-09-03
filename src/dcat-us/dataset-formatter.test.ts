import { dcatTemplate, formatDcatDataset } from './dataset-formatter';

it('dcatHelper: it does not allow customizations to overwrite critical fields', () => {
  const customizations = {
    '@type': 'SABOTAGE',
    title: '{{metadata.metadata.name||item.title}}',
    publisher: {
      name: 'Bad Actor',
    },
    contactPoint: {
      '@type': 'SABOTAGE',
      fn: '{{item.owner}}',
      hasEmail: 'mailto:dcat.support@dc.gov',
    },
  };
  const template = dcatTemplate(customizations);
  expect(template['@type']).not.toBe('SABOTAGE');
  expect(template.contactPoint['@type']).not.toBe('SABOTAGE');
});

it('dcatHelper: it does not throw an error if there are no customizations', () => {
  const customizations = undefined;
  const template = dcatTemplate(customizations);
  expect(template).toBeTruthy();
});

it('dcatHelper: it does not throw an error customizations are null', () => {
  const customizations = null;
  const template = dcatTemplate(customizations);
  expect(template).toBeTruthy();
});

describe('formatDcatDataset', () => {
  const siteUrl = 'https://foobar.hub.arcgis.com';

  it('object: should render links with the correct SRID', () => {
    const dataset = {
      owner: 'fpgis.CALFIRE',
      created: 1570747289000,
      modified: 1570747379000,
      tags: ['Uno', 'Dos', 'Tres'],
      extent: {
        coordinates: [
          [-123.8832, 35.0024],
          [-118.3281, 42.0122],
        ],
        type: 'envelope',
      },
      name: 'DCAT_Test',
      description: 'Some Description',
      source: 'Test Source',
      id: '00000000000000000000000000000000_0',
      type: 'Feature Layer',
      url: 'https://services1.arcgis.com/jUJYIo9tSA7EHvfZ/arcgis/rest/services/DCAT_Test/FeatureServer/0',
      layer: {
        geometryType: 'esriGeometryPolygon',
      },
      server: {
        spatialReference: {
          latestWkid: 3310,
          wkid: 3310,
        },
      },
    };
    const expected = {
      '@type': 'dcat:Dataset',
      identifier: `${siteUrl}/datasets/00000000000000000000000000000000_0`,
      license: '',
      landingPage: `${siteUrl}/datasets/00000000000000000000000000000000_0`,
      title: 'DCAT_Test',
      description: 'Some Description',
      keyword: ['Uno', 'Dos', 'Tres'],
      issued: '2019-10-10T22:41:29.000Z',
      modified: '2019-10-10T22:42:59.000Z',
      publisher: { name: 'Test Source' },
      contactPoint: { '@type': 'vcard:Contact', fn: 'fpgis.CALFIRE' },
      accessLevel: 'public',
      distribution: [
        {
          '@type': 'dcat:Distribution',
          title: 'ArcGIS Hub Dataset',
          format: 'Web Page',
          mediaType: 'text/html',
          accessURL: `${siteUrl}/datasets/00000000000000000000000000000000_0`,
        },
        {
          '@type': 'dcat:Distribution',
          title: 'ArcGIS GeoService',
          format: 'ArcGIS GeoServices REST API',
          mediaType: 'application/json',
          accessURL:
            'https://services1.arcgis.com/jUJYIo9tSA7EHvfZ/arcgis/rest/services/DCAT_Test/FeatureServer/0',
        },
        {
          '@type': 'dcat:Distribution',
          title: 'GeoJSON',
          format: 'GeoJSON',
          mediaType: 'application/vnd.geo+json',
          accessURL: `${siteUrl}/datasets/00000000000000000000000000000000_0.geojson?outSR=${encodeURIComponent(
            JSON.stringify(dataset.server.spatialReference),
          )}`,
        },
        {
          '@type': 'dcat:Distribution',
          title: 'CSV',
          format: 'CSV',
          mediaType: 'text/csv',
          accessURL: `${siteUrl}/datasets/00000000000000000000000000000000_0.csv?outSR=${encodeURIComponent(
            JSON.stringify(dataset.server.spatialReference),
          )}`,
        },
        {
          '@type': 'dcat:Distribution',
          title: 'KML',
          format: 'KML',
          mediaType: 'application/vnd.google-earth.kml+xml',
          accessURL: `${siteUrl}/datasets/00000000000000000000000000000000_0.kml?outSR=${encodeURIComponent(
            JSON.stringify(dataset.server.spatialReference),
          )}`,
        },
        {
          '@type': 'dcat:Distribution',
          title: 'Shapefile',
          format: 'ZIP',
          mediaType: 'application/zip',
          accessURL: `${siteUrl}/datasets/00000000000000000000000000000000_0.zip?outSR=${encodeURIComponent(
            JSON.stringify(dataset.server.spatialReference),
          )}`,
        },
      ],
      spatial: '-123.8832,35.0024,-118.3281,42.0122',
      theme: ['geospatial'],
    };
    const actual = JSON.parse(formatDcatDataset(dataset, siteUrl));
    expect(actual).toEqual(expected);
  });

  it('object: should render links without the srid', () => {
    const dataset = {
      owner: 'fpgis.CALFIRE',
      created: 1570747289000,
      modified: 1570747379000,
      tags: ['Uno', 'Dos', 'Tres'],
      extent: {
        coordinates: [
          [-123.8832, 35.0024],
          [-118.3281, 42.0122],
        ],
        type: 'envelope',
      },
      name: 'DCAT_Test',
      description: 'Some Description',
      source: 'Test Source',
      id: '00000000000000000000000000000000_0',
      type: 'Feature Layer',
      url: 'https://services1.arcgis.com/jUJYIo9tSA7EHvfZ/arcgis/rest/services/DCAT_Test/FeatureServer/0',
      layer: {
        geometryType: 'esriGeometryPolygon',
      },
      server: {},
    };
    const expected = {
      '@type': 'dcat:Dataset',
      identifier: `${siteUrl}/datasets/00000000000000000000000000000000_0`,
      license: '',
      landingPage: `${siteUrl}/datasets/00000000000000000000000000000000_0`,
      title: 'DCAT_Test',
      description: 'Some Description',
      keyword: ['Uno', 'Dos', 'Tres'],
      issued: '2019-10-10T22:41:29.000Z',
      modified: '2019-10-10T22:42:59.000Z',
      publisher: { name: 'Test Source' },
      contactPoint: { '@type': 'vcard:Contact', fn: 'fpgis.CALFIRE' },
      accessLevel: 'public',
      distribution: [
        {
          '@type': 'dcat:Distribution',
          title: 'ArcGIS Hub Dataset',
          format: 'Web Page',
          mediaType: 'text/html',
          accessURL: `${siteUrl}/datasets/00000000000000000000000000000000_0`,
        },
        {
          '@type': 'dcat:Distribution',
          title: 'ArcGIS GeoService',
          format: 'ArcGIS GeoServices REST API',
          mediaType: 'application/json',
          accessURL:
            'https://services1.arcgis.com/jUJYIo9tSA7EHvfZ/arcgis/rest/services/DCAT_Test/FeatureServer/0',
        },
        {
          '@type': 'dcat:Distribution',
          title: 'GeoJSON',
          format: 'GeoJSON',
          mediaType: 'application/vnd.geo+json',
          accessURL: `${siteUrl}/datasets/00000000000000000000000000000000_0.geojson`,
        },
        {
          '@type': 'dcat:Distribution',
          title: 'CSV',
          format: 'CSV',
          mediaType: 'text/csv',
          accessURL: `${siteUrl}/datasets/00000000000000000000000000000000_0.csv`,
        },
        {
          '@type': 'dcat:Distribution',
          title: 'KML',
          format: 'KML',
          mediaType: 'application/vnd.google-earth.kml+xml',
          accessURL: `${siteUrl}/datasets/00000000000000000000000000000000_0.kml`,
        },
        {
          '@type': 'dcat:Distribution',
          title: 'Shapefile',
          format: 'ZIP',
          mediaType: 'application/zip',
          accessURL: `${siteUrl}/datasets/00000000000000000000000000000000_0.zip`,
        },
      ],
      spatial: '-123.8832,35.0024,-118.3281,42.0122',
      theme: ['geospatial'],
    };
    const actual = JSON.parse(formatDcatDataset(dataset, siteUrl));
    expect(actual).toEqual(expected);
  });

  it('object: should override theme when theme customizations is an empty array', () => {
    const dataset = {
      owner: 'fpgis.CALFIRE',
      created: 1570747289000,
      modified: 1570747379000,
      tags: ['Uno', 'Dos', 'Tres'],
      extent: {
        coordinates: [
          [-123.8832, 35.0024],
          [-118.3281, 42.0122],
        ],
        type: 'envelope',
      },
      name: 'DCAT_Test',
      description: 'Some Description',
      source: 'Test Source',
      id: '00000000000000000000000000000000_0',
      type: 'Feature Layer',
      url: 'https://services1.arcgis.com/jUJYIo9tSA7EHvfZ/arcgis/rest/services/DCAT_Test/FeatureServer/0',
      layer: {
        geometryType: 'esriGeometryPolygon',
      },
      server: {},
    };
    const expected = {
      '@type': 'dcat:Dataset',
      identifier: `${siteUrl}/datasets/00000000000000000000000000000000_0`,
      license: '',
      landingPage: `${siteUrl}/datasets/00000000000000000000000000000000_0`,
      title: 'DCAT_Test',
      description: 'Some Description',
      keyword: ['Uno', 'Dos', 'Tres'],
      issued: '2019-10-10T22:41:29.000Z',
      modified: '2019-10-10T22:42:59.000Z',
      publisher: { name: 'Test Source' },
      contactPoint: { '@type': 'vcard:Contact', fn: 'fpgis.CALFIRE' },
      accessLevel: 'public',
      distribution: [
        {
          '@type': 'dcat:Distribution',
          title: 'ArcGIS Hub Dataset',
          format: 'Web Page',
          mediaType: 'text/html',
          accessURL: `${siteUrl}/datasets/00000000000000000000000000000000_0`,
        },
        {
          '@type': 'dcat:Distribution',
          title: 'ArcGIS GeoService',
          format: 'ArcGIS GeoServices REST API',
          mediaType: 'application/json',
          accessURL:
            'https://services1.arcgis.com/jUJYIo9tSA7EHvfZ/arcgis/rest/services/DCAT_Test/FeatureServer/0',
        },
        {
          '@type': 'dcat:Distribution',
          title: 'GeoJSON',
          format: 'GeoJSON',
          mediaType: 'application/vnd.geo+json',
          accessURL: `${siteUrl}/datasets/00000000000000000000000000000000_0.geojson`,
        },
        {
          '@type': 'dcat:Distribution',
          title: 'CSV',
          format: 'CSV',
          mediaType: 'text/csv',
          accessURL: `${siteUrl}/datasets/00000000000000000000000000000000_0.csv`,
        },
        {
          '@type': 'dcat:Distribution',
          title: 'KML',
          format: 'KML',
          mediaType: 'application/vnd.google-earth.kml+xml',
          accessURL: `${siteUrl}/datasets/00000000000000000000000000000000_0.kml`,
        },
        {
          '@type': 'dcat:Distribution',
          title: 'Shapefile',
          format: 'ZIP',
          mediaType: 'application/zip',
          accessURL: `${siteUrl}/datasets/00000000000000000000000000000000_0.zip`,
        },
      ],
      spatial: '-123.8832,35.0024,-118.3281,42.0122',
      theme: ['geospatial'],
    };
    const actual = JSON.parse(
      formatDcatDataset(dataset, siteUrl, { theme: [] }),
    );
    expect(actual).toEqual(expected);
  });

  it('object: should _NOT_ override theme when theme customizations is supplied', () => {
    const dataset = {
      owner: 'fpgis.CALFIRE',
      created: 1570747289000,
      modified: 1570747379000,
      tags: ['Uno', 'Dos', 'Tres'],
      extent: {
        coordinates: [
          [-123.8832, 35.0024],
          [-118.3281, 42.0122],
        ],
        type: 'envelope',
      },
      name: 'DCAT_Test',
      description: 'Some Description',
      source: 'Test Source',
      id: '00000000000000000000000000000000_0',
      type: 'Feature Layer',
      url: 'https://services1.arcgis.com/jUJYIo9tSA7EHvfZ/arcgis/rest/services/DCAT_Test/FeatureServer/0',
      layer: {
        geometryType: 'esriGeometryPolygon',
      },
      server: {},
    };
    const expected = {
      '@type': 'dcat:Dataset',
      identifier: `${siteUrl}/datasets/00000000000000000000000000000000_0`,
      license: '',
      landingPage: `${siteUrl}/datasets/00000000000000000000000000000000_0`,
      title: 'DCAT_Test',
      description: 'Some Description',
      keyword: ['Uno', 'Dos', 'Tres'],
      issued: '2019-10-10T22:41:29.000Z',
      modified: '2019-10-10T22:42:59.000Z',
      publisher: { name: 'Test Source' },
      contactPoint: { '@type': 'vcard:Contact', fn: 'fpgis.CALFIRE' },
      accessLevel: 'public',
      distribution: [
        {
          '@type': 'dcat:Distribution',
          title: 'ArcGIS Hub Dataset',
          format: 'Web Page',
          mediaType: 'text/html',
          accessURL: `${siteUrl}/datasets/00000000000000000000000000000000_0`,
        },
        {
          '@type': 'dcat:Distribution',
          title: 'ArcGIS GeoService',
          format: 'ArcGIS GeoServices REST API',
          mediaType: 'application/json',
          accessURL:
            'https://services1.arcgis.com/jUJYIo9tSA7EHvfZ/arcgis/rest/services/DCAT_Test/FeatureServer/0',
        },
        {
          '@type': 'dcat:Distribution',
          title: 'GeoJSON',
          format: 'GeoJSON',
          mediaType: 'application/vnd.geo+json',
          accessURL: `${siteUrl}/datasets/00000000000000000000000000000000_0.geojson`,
        },
        {
          '@type': 'dcat:Distribution',
          title: 'CSV',
          format: 'CSV',
          mediaType: 'text/csv',
          accessURL: `${siteUrl}/datasets/00000000000000000000000000000000_0.csv`,
        },
        {
          '@type': 'dcat:Distribution',
          title: 'KML',
          format: 'KML',
          mediaType: 'application/vnd.google-earth.kml+xml',
          accessURL: `${siteUrl}/datasets/00000000000000000000000000000000_0.kml`,
        },
        {
          '@type': 'dcat:Distribution',
          title: 'Shapefile',
          format: 'ZIP',
          mediaType: 'application/zip',
          accessURL: `${siteUrl}/datasets/00000000000000000000000000000000_0.zip`,
        },
      ],
      spatial: '-123.8832,35.0024,-118.3281,42.0122',
      theme: ['my theme'],
    };
    const actual = JSON.parse(
      formatDcatDataset(dataset, siteUrl, { theme: ['my theme'] }),
    );
    expect(actual).toEqual(expected);
  });

  it('object: should render links with the correct SRID', () => {
    const dataset = {
      owner: 'fpgis.CALFIRE',
      created: 1570747289000,
      modified: 1570747379000,
      tags: ['Uno', 'Dos', 'Tres'],
      extent: {
        coordinates: [
          [-123.8832, 35.0024],
          [-118.3281, 42.0122],
        ],
        type: 'envelope',
      },
      name: 'DCAT_Test',
      description: 'Some Description',
      source: 'Test Source',
      id: '00000000000000000000000000000000_0',
      type: 'Feature Layer',
      url: 'https://services1.arcgis.com/jUJYIo9tSA7EHvfZ/arcgis/rest/services/DCAT_Test/FeatureServer/0',
      layer: {
        geometryType: 'esriGeometryPolygon',
      },
      server: {
        spatialReference: {
          wkid: 3310,
        },
      },
    };
    const expected = {
      '@type': 'dcat:Dataset',
      identifier: `${siteUrl}/datasets/00000000000000000000000000000000_0`,
      license: '',
      landingPage: `${siteUrl}/datasets/00000000000000000000000000000000_0`,
      title: 'DCAT_Test',
      description: 'Some Description',
      keyword: ['Uno', 'Dos', 'Tres'],
      issued: '2019-10-10T22:41:29.000Z',
      modified: '2019-10-10T22:42:59.000Z',
      publisher: { name: 'Test Source' },
      contactPoint: { '@type': 'vcard:Contact', fn: 'fpgis.CALFIRE' },
      accessLevel: 'public',
      distribution: [
        {
          '@type': 'dcat:Distribution',
          title: 'ArcGIS Hub Dataset',
          format: 'Web Page',
          mediaType: 'text/html',
          accessURL: `${siteUrl}/datasets/00000000000000000000000000000000_0`,
        },
        {
          '@type': 'dcat:Distribution',
          title: 'ArcGIS GeoService',
          format: 'ArcGIS GeoServices REST API',
          mediaType: 'application/json',
          accessURL:
            'https://services1.arcgis.com/jUJYIo9tSA7EHvfZ/arcgis/rest/services/DCAT_Test/FeatureServer/0',
        },
        {
          '@type': 'dcat:Distribution',
          title: 'GeoJSON',
          format: 'GeoJSON',
          mediaType: 'application/vnd.geo+json',
          accessURL: `${siteUrl}/datasets/00000000000000000000000000000000_0.geojson?outSR=%7B%22wkid%22%3A3310%7D`,
        },
        {
          '@type': 'dcat:Distribution',
          title: 'CSV',
          format: 'CSV',
          mediaType: 'text/csv',
          accessURL: `${siteUrl}/datasets/00000000000000000000000000000000_0.csv?outSR=%7B%22wkid%22%3A3310%7D`,
        },
        {
          '@type': 'dcat:Distribution',
          title: 'KML',
          format: 'KML',
          mediaType: 'application/vnd.google-earth.kml+xml',
          accessURL: `${siteUrl}/datasets/00000000000000000000000000000000_0.kml?outSR=%7B%22wkid%22%3A3310%7D`,
        },
        {
          '@type': 'dcat:Distribution',
          title: 'Shapefile',
          format: 'ZIP',
          mediaType: 'application/zip',
          accessURL: `${siteUrl}/datasets/00000000000000000000000000000000_0.zip?outSR=%7B%22wkid%22%3A3310%7D`,
        },
      ],
      spatial: '-123.8832,35.0024,-118.3281,42.0122',
      theme: ['geospatial'],
    };
    const actual = JSON.parse(formatDcatDataset(dataset, siteUrl));
    expect(actual).toEqual(expected);
  });

  it('object: license should display structuredLicense url', () => {
    const dataset = {
      owner: 'fpgis.CALFIRE',
      created: 1570747289000,
      modified: 1570747379000,
      tags: ['Uno', 'Dos', 'Tres'],
      extent: {
        coordinates: [
          [-123.8832, 35.0024],
          [-118.3281, 42.0122],
        ],
        type: 'envelope',
      },
      name: 'DCAT_Test',
      description: 'Some Description',
      source: 'Test Source',
      id: '00000000000000000000000000000000_0',
      type: 'Feature Layer',
      url: 'https://services1.arcgis.com/jUJYIo9tSA7EHvfZ/arcgis/rest/services/DCAT_Test/FeatureServer/0',
      layer: {
        geometryType: 'esriGeometryPolygon',
      },
      server: {
        spatialReference: {
          wkid: 3310,
        },
      },
      structuredLicense: { text: 'structuredLicense text', url: 'https://google.com' },
      licenseInfo: 'licenseInfo text',
    };
    const expectedLicense = 'https://google.com';

    const actual = JSON.parse(formatDcatDataset(dataset, siteUrl));
    expect(actual.license).toEqual(expectedLicense);
  });

  it('object: license should be empty when structuredLicense.url is unavailable', () => {
    const dataset = {
      owner: 'fpgis.CALFIRE',
      created: 1570747289000,
      modified: 1570747379000,
      tags: ['Uno', 'Dos', 'Tres'],
      extent: {
        coordinates: [
          [-123.8832, 35.0024],
          [-118.3281, 42.0122],
        ],
        type: 'envelope',
      },
      name: 'DCAT_Test',
      description: 'Some Description',
      source: 'Test Source',
      id: '00000000000000000000000000000000_0',
      type: 'Feature Layer',
      url: 'https://services1.arcgis.com/jUJYIo9tSA7EHvfZ/arcgis/rest/services/DCAT_Test/FeatureServer/0',
      layer: {
        geometryType: 'esriGeometryPolygon',
      },
      server: {
        spatialReference: {
          wkid: 3310,
        },
      },
      structuredLicense: { text: 'structuredLicense text' },
      licenseInfo: 'licenseInfo text',
    };
    const expectedLicense = '';

    const actual = JSON.parse(formatDcatDataset(dataset, siteUrl));
    expect(actual.license).toEqual(expectedLicense);
  });

  it('object: license should display an empty string when structuredLicense is unavailable', () => {
    const dataset = {
      owner: 'fpgis.CALFIRE',
      created: 1570747289000,
      modified: 1570747379000,
      tags: ['Uno', 'Dos', 'Tres'],
      extent: {
        coordinates: [
          [-123.8832, 35.0024],
          [-118.3281, 42.0122],
        ],
        type: 'envelope',
      },
      name: 'DCAT_Test',
      description: 'Some Description',
      source: 'Test Source',
      id: '00000000000000000000000000000000_0',
      type: 'Feature Layer',
      url: 'https://services1.arcgis.com/jUJYIo9tSA7EHvfZ/arcgis/rest/services/DCAT_Test/FeatureServer/0',
      layer: {
        geometryType: 'esriGeometryPolygon',
      },
      server: {
        spatialReference: {
          wkid: 3310,
        },
      },
      licenseInfo: 'licenseInfo text',
    };
    const expectedLicense = '';

    const actual = JSON.parse(formatDcatDataset(dataset, siteUrl));
    expect(actual.license).toEqual(expectedLicense);
  });

  test('object: Hub Page gets default keyword when no tags', () => {
    const datasetWithNoTags = {
      owner: 'fpgis.CALFIRE',
      type: 'Hub Page',
      typeKeywords: [
        'Hub',
        'hubPage',
        'JavaScript',
        'Map',
        'Mapping Site',
        'Online Map',
        'OpenData',
        'selfConfigured',
        'Web Map',
      ],
      created: 1570747289000,
      modified: 1570747379000,
      extent: {
        coordinates: [
          [-123.8832, 35.0024],
          [-118.3281, 42.0122],
        ],
        type: 'envelope',
      },
      name: 'DCAT_Test',
      description: 'Some Description',
      source: 'Test Source',
      id: '00000000000000000000000000000000_0',
      url: 'https://services1.arcgis.com/jUJYIo9tSA7EHvfZ/arcgis/rest/services/DCAT_Test/FeatureServer/0',
      layer: {
        geometryType: 'esriGeometryPolygon',
      },
      server: {
        spatialReference: {
          wkid: 3310,
        },
      },
      licenseInfo: 'licenseInfo text',
    };
    const expectedKeyword = 'ArcGIS Hub page';
    expect(
      JSON.parse(formatDcatDataset(datasetWithNoTags, siteUrl)).keyword[0],
    ).toBe(expectedKeyword);
    expect(
      JSON.parse(formatDcatDataset({ ...datasetWithNoTags, tags: [] }, siteUrl))
        .keyword[0],
    ).toBe(expectedKeyword);
    expect(
      JSON.parse(
        formatDcatDataset({ ...datasetWithNoTags, tags: [''] }, siteUrl),
      ).keyword[0],
    ).toBe(expectedKeyword);
  });

  it('object: should create custom distribution when data is supplied', () => {
    const dataset = {
      owner: 'fpgis.CALFIRE',
      created: 1570747289000,
      modified: 1570747379000,
      tags: ['Uno', 'Dos', 'Tres'],
      extent: {
        coordinates: [
          [-123.8832, 35.0024],
          [-118.3281, 42.0122],
        ],
        type: 'envelope',
      },
      name: 'DCAT_Test',
      description: 'Some Description',
      source: 'Test Source',
      id: '00000000000000000000000000000000_0',
      type: 'Feature Layer',
      url: 'https://services1.arcgis.com/jUJYIo9tSA7EHvfZ/arcgis/rest/services/DCAT_Test/FeatureServer/0',
      layer: {
        geometryType: 'esriGeometryPolygon',
      },
      server: {
        spatialReference: {
          wkid: 3310,
        },
      },
      metadata: {
        metadata: {
          distInfo: {
            distTranOps: {
              onLineSrc: [
                {
                  protocol: 'GeoService REST API',
                  orDesc: 'endpoint',
                  linkage: `${siteUrl}/datasets/00000000000000000000000000000000_0`,
                  orName: 'ArcGIS GeoService',
                },
              ],
            },
          },
        },
      },
    };
    const expectedDistribution = {
      '@type': 'dcat:Distribution',
      title: 'ArcGIS GeoService',
      format: 'GeoService REST API',
      accessURL: `${siteUrl}/datasets/00000000000000000000000000000000_0`,
      description: 'endpoint',
    };

    const actual = JSON.parse(formatDcatDataset(dataset, siteUrl));
    expect(actual.distribution.pop()).toEqual(expectedDistribution);
  });

  it('object: doesnt blow up when onLineSrc is not an array', () => {
    const dataset = {
      owner: 'fpgis.CALFIRE',
      created: 1570747289000,
      modified: 1570747379000,
      tags: ['Uno', 'Dos', 'Tres'],
      extent: {
        coordinates: [
          [-123.8832, 35.0024],
          [-118.3281, 42.0122],
        ],
        type: 'envelope',
      },
      name: 'DCAT_Test',
      description: 'Some Description',
      source: 'Test Source',
      id: '00000000000000000000000000000000_0',
      type: 'Feature Layer',
      url: 'https://services1.arcgis.com/jUJYIo9tSA7EHvfZ/arcgis/rest/services/DCAT_Test/FeatureServer/0',
      layer: {
        geometryType: 'esriGeometryPolygon',
      },
      server: {
        spatialReference: {
          wkid: 3310,
        },
      },
      metadata: {
        metadata: {
          distInfo: {
            distTranOps: {
              onLineSrc: {
                linkage: 'https://foobar.com',
              },
            },
          },
        },
      },
    };

    try {
      formatDcatDataset(dataset, siteUrl);
    } catch {
      fail('Should not throw!');
    }
  });
});
