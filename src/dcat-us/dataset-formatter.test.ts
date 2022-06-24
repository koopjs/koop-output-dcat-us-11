import { IModel } from '@esri/hub-common';
import { buildDatasetTemplate, formatDcatDataset } from './dataset-formatter';

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
    identifier: 'SABOTAGE',
    landingPage: 'SABOTAGE',
    webService: 'SABOTAGE',
    spatial: 'SABOTAGE',
  };
  const template = buildDatasetTemplate(customizations);
  expect(template['@type']).not.toBe('SABOTAGE');
  expect(template.contactPoint['@type']).not.toBe('SABOTAGE');
  expect(template.identifier).not.toBe('SABOTAGE');
  expect(template.landingPage).not.toBe('SABOTAGE');
  expect(template.webService).not.toBe('SABOTAGE');
  expect(template.spatial).not.toBe('SABOTAGE');
  expect(template.title).toBe('{{metadata.metadata.name||item.title}}')
  expect(template.contactPoint.fn).toBe('{{item.owner}}');
  expect(template.contactPoint.hasEmail).toBe('mailto:dcat.support@dc.gov');
});

it('dcatHelper: it does not throw an error if there are no customizations', () => {
  const customizations = undefined;
  const template = buildDatasetTemplate(customizations);
  expect(template).toBeTruthy();
});

it('dcatHelper: it does not throw an error customizations are null', () => {
  const customizations = undefined;
  const template = buildDatasetTemplate(customizations);
  expect(template).toBeTruthy();
});

describe('formatDcatDataset', () => {
  const siteUrl = 'https://foobar.hub.arcgis.com';
  const siteModel = { item: { url: siteUrl } } as unknown as IModel;

  it('should render links with the correct SRID', () => {
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
      identifier: 'CALFIRE::DCAT_Test',
      slug: 'CALFIRE::DCAT_Test'
    };
    const expected = {
      '@type': 'dcat:Dataset',
      identifier: `${siteUrl}/maps/CALFIRE::DCAT_Test`,
      license: '',
      landingPage: `${siteUrl}/maps/CALFIRE::DCAT_Test`,
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
          accessURL: `${siteUrl}/maps/CALFIRE::DCAT_Test`,
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
          accessURL: `${siteUrl}/datasets/CALFIRE::DCAT_Test.geojson?outSR=${encodeURIComponent(
            JSON.stringify(dataset.server.spatialReference),
          )}`,
        },
        {
          '@type': 'dcat:Distribution',
          title: 'CSV',
          format: 'CSV',
          mediaType: 'text/csv',
          accessURL: `${siteUrl}/datasets/CALFIRE::DCAT_Test.csv?outSR=${encodeURIComponent(
            JSON.stringify(dataset.server.spatialReference),
          )}`,
        },
        {
          '@type': 'dcat:Distribution',
          title: 'KML',
          format: 'KML',
          mediaType: 'application/vnd.google-earth.kml+xml',
          accessURL: `${siteUrl}/datasets/CALFIRE::DCAT_Test.kml?outSR=${encodeURIComponent(
            JSON.stringify(dataset.server.spatialReference),
          )}`,
        },
        {
          '@type': 'dcat:Distribution',
          title: 'Shapefile',
          format: 'ZIP',
          mediaType: 'application/zip',
          accessURL: `${siteUrl}/datasets/CALFIRE::DCAT_Test.zip?outSR=${encodeURIComponent(
            JSON.stringify(dataset.server.spatialReference),
          )}`,
        },
      ],
      spatial: '-123.8832,35.0024,-118.3281,42.0122',
      theme: ['geospatial'],
    };
    const actual = JSON.parse(formatDcatDataset(dataset, siteUrl, siteModel, buildDatasetTemplate()));
    expect(actual).toEqual(expected);
  });

  it('should render links without the srid', () => {
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
      identifier: 'CALFIRE::DCAT_Test',
      slug: 'CALFIRE::DCAT_Test'
    };
    const expected = {
      '@type': 'dcat:Dataset',
      identifier: `${siteUrl}/maps/CALFIRE::DCAT_Test`,
      license: '',
      landingPage: `${siteUrl}/maps/CALFIRE::DCAT_Test`,
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
          accessURL: `${siteUrl}/maps/CALFIRE::DCAT_Test`,
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
          accessURL: `${siteUrl}/datasets/CALFIRE::DCAT_Test.geojson`,
        },
        {
          '@type': 'dcat:Distribution',
          title: 'CSV',
          format: 'CSV',
          mediaType: 'text/csv',
          accessURL: `${siteUrl}/datasets/CALFIRE::DCAT_Test.csv`,
        },
        {
          '@type': 'dcat:Distribution',
          title: 'KML',
          format: 'KML',
          mediaType: 'application/vnd.google-earth.kml+xml',
          accessURL: `${siteUrl}/datasets/CALFIRE::DCAT_Test.kml`,
        },
        {
          '@type': 'dcat:Distribution',
          title: 'Shapefile',
          format: 'ZIP',
          mediaType: 'application/zip',
          accessURL: `${siteUrl}/datasets/CALFIRE::DCAT_Test.zip`,
        },
      ],
      spatial: '-123.8832,35.0024,-118.3281,42.0122',
      theme: ['geospatial'],
    };
    const actual = JSON.parse(formatDcatDataset(dataset, siteUrl, siteModel, buildDatasetTemplate()));
    expect(actual).toEqual(expected);
  });

  it('should override theme when theme customizations is an empty array', () => {
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
      identifier: 'CALFIRE::DCAT_Test',
      slug: 'CALFIRE::DCAT_Test'
    };
    const expected = {
      '@type': 'dcat:Dataset',
      identifier: `${siteUrl}/maps/CALFIRE::DCAT_Test`,
      license: '',
      landingPage: `${siteUrl}/maps/CALFIRE::DCAT_Test`,
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
          accessURL: `${siteUrl}/maps/CALFIRE::DCAT_Test`,
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
          accessURL: `${siteUrl}/datasets/CALFIRE::DCAT_Test.geojson`,
        },
        {
          '@type': 'dcat:Distribution',
          title: 'CSV',
          format: 'CSV',
          mediaType: 'text/csv',
          accessURL: `${siteUrl}/datasets/CALFIRE::DCAT_Test.csv`,
        },
        {
          '@type': 'dcat:Distribution',
          title: 'KML',
          format: 'KML',
          mediaType: 'application/vnd.google-earth.kml+xml',
          accessURL: `${siteUrl}/datasets/CALFIRE::DCAT_Test.kml`,
        },
        {
          '@type': 'dcat:Distribution',
          title: 'Shapefile',
          format: 'ZIP',
          mediaType: 'application/zip',
          accessURL: `${siteUrl}/datasets/CALFIRE::DCAT_Test.zip`,
        },
      ],
      spatial: '-123.8832,35.0024,-118.3281,42.0122',
      theme: ['geospatial'],
    };
    const actual = JSON.parse(
      formatDcatDataset(dataset, siteUrl, siteModel, buildDatasetTemplate({ theme: [] })),
    );
    expect(actual).toEqual(expected);
  });

  it('should _NOT_ override theme when theme customizations is supplied', () => {
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
      identifier: 'CALFIRE::DCAT_Test',
      slug: 'CALFIRE::DCAT_Test'
    };
    const expected = {
      '@type': 'dcat:Dataset',
      identifier: `${siteUrl}/maps/CALFIRE::DCAT_Test`,
      license: '',
      landingPage: `${siteUrl}/maps/CALFIRE::DCAT_Test`,
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
          accessURL: `${siteUrl}/maps/CALFIRE::DCAT_Test`,
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
          accessURL: `${siteUrl}/datasets/CALFIRE::DCAT_Test.geojson`,
        },
        {
          '@type': 'dcat:Distribution',
          title: 'CSV',
          format: 'CSV',
          mediaType: 'text/csv',
          accessURL: `${siteUrl}/datasets/CALFIRE::DCAT_Test.csv`,
        },
        {
          '@type': 'dcat:Distribution',
          title: 'KML',
          format: 'KML',
          mediaType: 'application/vnd.google-earth.kml+xml',
          accessURL: `${siteUrl}/datasets/CALFIRE::DCAT_Test.kml`,
        },
        {
          '@type': 'dcat:Distribution',
          title: 'Shapefile',
          format: 'ZIP',
          mediaType: 'application/zip',
          accessURL: `${siteUrl}/datasets/CALFIRE::DCAT_Test.zip`,
        },
      ],
      spatial: '-123.8832,35.0024,-118.3281,42.0122',
      theme: ['my theme'],
    };
    const actual = JSON.parse(
      formatDcatDataset(dataset, siteUrl, siteModel, buildDatasetTemplate({ theme: ['my theme'] })),
    );
    expect(actual).toEqual(expected);
  });

  it('should render links with the correct SRID', () => {
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
      identifier: 'CALFIRE::DCAT_Test',
      slug: 'CALFIRE::DCAT_Test'
    };
    const expected = {
      '@type': 'dcat:Dataset',
      identifier: `${siteUrl}/maps/CALFIRE::DCAT_Test`,
      license: '',
      landingPage: `${siteUrl}/maps/CALFIRE::DCAT_Test`,
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
          accessURL: `${siteUrl}/maps/CALFIRE::DCAT_Test`,
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
          accessURL: `${siteUrl}/datasets/CALFIRE::DCAT_Test.geojson?outSR=%7B%22wkid%22%3A3310%7D`,
        },
        {
          '@type': 'dcat:Distribution',
          title: 'CSV',
          format: 'CSV',
          mediaType: 'text/csv',
          accessURL: `${siteUrl}/datasets/CALFIRE::DCAT_Test.csv?outSR=%7B%22wkid%22%3A3310%7D`,
        },
        {
          '@type': 'dcat:Distribution',
          title: 'KML',
          format: 'KML',
          mediaType: 'application/vnd.google-earth.kml+xml',
          accessURL: `${siteUrl}/datasets/CALFIRE::DCAT_Test.kml?outSR=%7B%22wkid%22%3A3310%7D`,
        },
        {
          '@type': 'dcat:Distribution',
          title: 'Shapefile',
          format: 'ZIP',
          mediaType: 'application/zip',
          accessURL: `${siteUrl}/datasets/CALFIRE::DCAT_Test.zip?outSR=%7B%22wkid%22%3A3310%7D`,
        },
      ],
      spatial: '-123.8832,35.0024,-118.3281,42.0122',
      theme: ['geospatial'],
    };
    const actual = JSON.parse(formatDcatDataset(dataset, siteUrl, siteModel, buildDatasetTemplate()));
    expect(actual).toEqual(expected);
  });

  it('license should be editable with templated value', () => {
    const template = buildDatasetTemplate();
    template.license = '{{owner}}'
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
    const expectedLicense = 'fpgis.CALFIRE';

    const actual = JSON.parse(formatDcatDataset(dataset, siteUrl, siteModel, template));
    expect(actual.license).toEqual(expectedLicense);
  });

  it('license should be editable with literal value', () => {
    const template = buildDatasetTemplate();
    template.license = 'A HARDCODED LICENSE'
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
    const expectedLicense = 'A HARDCODED LICENSE';

    const actual = JSON.parse(formatDcatDataset(dataset, siteUrl, siteModel, template));
    expect(actual.license).toEqual(expectedLicense);
  });

  it('license should display structuredLicense url', () => {
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

    const actual = JSON.parse(formatDcatDataset(dataset, siteUrl, siteModel, buildDatasetTemplate()));
    expect(actual.license).toEqual(expectedLicense);
  });

  it('license should use licenseInfo when structuredLicense.url is unavailable', () => {
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
    const expectedLicense = 'licenseInfo text';

    const actual = JSON.parse(formatDcatDataset(dataset, siteUrl, siteModel, buildDatasetTemplate()));
    expect(actual.license).toEqual(expectedLicense);
  });

  it('license should display empty string when neither structuredLicense nor licenseInfo are available', () => {
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
    const expectedLicense = '';

    const actual = JSON.parse(formatDcatDataset(dataset, siteUrl, siteModel, buildDatasetTemplate()));
    expect(actual.license).toEqual(expectedLicense);
  });

  it('license should be overwritten if it is specified as "none"', () => {
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
      license: 'none'
    };
    
    const expectedLicense = 'a-custom-license';

    const actual = JSON.parse(formatDcatDataset(dataset, siteUrl, siteModel, buildDatasetTemplate({
      license: '{{license || a-custom-license}}'
    })));
    expect(actual.license).toEqual(expectedLicense);
  });

  test('Hub Page gets default keyword when no tags', () => {
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
      JSON.parse(formatDcatDataset(datasetWithNoTags, siteUrl, siteModel, buildDatasetTemplate())).keyword[0],
    ).toBe(expectedKeyword);
    expect(
      JSON.parse(formatDcatDataset({ ...datasetWithNoTags, tags: [] }, siteUrl, siteModel, buildDatasetTemplate()))
        .keyword[0],
    ).toBe(expectedKeyword);
    expect(
      JSON.parse(
        formatDcatDataset({ ...datasetWithNoTags, tags: [''] }, siteUrl, siteModel, buildDatasetTemplate()),
      ).keyword[0],
    ).toBe(expectedKeyword);
  });

  it('should prepend custom distribution if template.distribution is a non-empty array', () => {
    const hubDataset = {
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

    const template = buildDatasetTemplate({
      distribution: [{
        interpolated: '{{name}}',
        constant: 'myConstant',
      }]
    });

    const expectedDistribution = {
      interpolated: 'DCAT_Test',
      constant: 'myConstant',
    };

    const actual = JSON.parse(formatDcatDataset(hubDataset, siteUrl, siteModel, template));
    expect(actual.distribution.shift()).toEqual(expectedDistribution);
  });

  it('should create distributions from metadata when data is supplied', () => {
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

    const actual = JSON.parse(formatDcatDataset(dataset, siteUrl, siteModel, buildDatasetTemplate()));
    expect(actual.distribution.pop()).toEqual(expectedDistribution);
  });

  it('doesnt blow up when onLineSrc is not an array', () => {
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
      formatDcatDataset(dataset, siteUrl, siteModel, buildDatasetTemplate());
    } catch {
      fail('Should not throw!');
    }
  });

  it('overwrites critical fields without values to an empty string', () => {
    const dataset = {
      owner: 'fpgis.CALFIRE',
      created: 1570747289000,
      modified: 1570747379000,
      tags: ['Uno', 'Dos', 'Tres'],
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
      const formatted = JSON.parse(formatDcatDataset(dataset, siteUrl, siteModel, buildDatasetTemplate()));
      expect(formatted.spatial).toEqual('');
    } catch {
      fail('Should not throw!');
    }
  });
});
