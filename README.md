# Koop Provider DCAT-US 1.1

[![TypeScript version][ts-badge]][typescript-4-3]
[![Node.js version][nodejs-badge]][nodejs]
[![APLv2][license-badge]][license]
[![Build Status - GitHub Actions][gha-badge]][gha-ci]

This is a Koop output plugin that transforms datasets from the ArcGIS Hub Search API into a DCAT-US 1.1 feed encoded in JSON. It currently only supports exporting a search catalog from an entire Hub Site.

Here is an example feed:
```json
{
  "@context": "https://project-open-data.cio.gov/v1.1/schema/catalog.jsonld",
  "@type": "dcat:Catalog",
  "conformsTo": "https://project-open-data.cio.gov/v1.1/schema",
  "describedBy": "https://project-open-data.cio.gov/v1.1/schema/catalog.json",
  "dataset": [
    {
      "@type": "dcat:Dataset",
      "identifier": "https://download-test-qa-pre-a-hub.hubqa.arcgis.com/datasets/f4bcc1035b7d46cba95e977f4affb6be_0",
      "license": "No license provided. Request permission to use.",
      "landingPage": "https://download-test-qa-pre-a-hub.hubqa.arcgis.com/datasets/f4bcc1035b7d46cba95e977f4affb6be_0",
      "title": "Tahoe places of interest",
      "description": "Description. Here be Tahoe things. You can do a lot here. Here are some more words. And a few more.<div><br /></div><div>with more words</div><div><br /></div><div>adding a few more to test how long it takes for our jobs to execute.</div><div><br /></div><div>Tom was here!</div>",
      "keyword": [
        "Data collection",
        "just modified"
      ],
      "issued": "2021-01-29T15:34:38.000Z",
      "modified": "2021-07-27T20:25:19.723Z",
      "publisher": {
        "name": "QA Premium Alpha Hub"
      },
      "contactPoint": {
        "@type": "vcard:Contact",
        "fn": "thervey_qa_pre_a_hub"
      },
      "accessLevel": "public",
      "distribution": [
        {
          "@type": "dcat:Distribution",
          "title": "ArcGIS Hub Dataset",
          "format": "Web Page",
          "mediaType": "text/html",
          "accessURL": "https://download-test-qa-pre-a-hub.hubqa.arcgis.com/datasets/f4bcc1035b7d46cba95e977f4affb6be_0"
        },
        {
          "@type": "dcat:Distribution",
          "title": "ArcGIS GeoService",
          "format": "ArcGIS GeoServices REST API",
          "mediaType": "application/json",
          "accessURL": "https://servicesqa.arcgis.com/Xj56SBi2udA78cC9/arcgis/rest/services/Tahoe_Things/FeatureServer/0"
        },
        {
          "@type": "dcat:Distribution",
          "title": "GeoJSON",
          "format": "GeoJSON",
          "mediaType": "application/vnd.geo+json",
          "accessURL": "https://download-test-qa-pre-a-hub.hubqa.arcgis.com/datasets/f4bcc1035b7d46cba95e977f4affb6be_0.geojson?outSR=%7B%22latestWkid%22%3A3857%2C%22wkid%22%3A102100%7D"
        },
        {
          "@type": "dcat:Distribution",
          "title": "CSV",
          "format": "CSV",
          "mediaType": "text/csv",
          "accessURL": "https://download-test-qa-pre-a-hub.hubqa.arcgis.com/datasets/f4bcc1035b7d46cba95e977f4affb6be_0.csv?outSR=%7B%22latestWkid%22%3A3857%2C%22wkid%22%3A102100%7D"
        },
        {
          "@type": "dcat:Distribution",
          "title": "KML",
          "format": "KML",
          "mediaType": "application/vnd.google-earth.kml+xml",
          "accessURL": "https://download-test-qa-pre-a-hub.hubqa.arcgis.com/datasets/f4bcc1035b7d46cba95e977f4affb6be_0.kml?outSR=%7B%22latestWkid%22%3A3857%2C%22wkid%22%3A102100%7D"
        },
        {
          "@type": "dcat:Distribution",
          "title": "Shapefile",
          "format": "ZIP",
          "mediaType": "application/zip",
          "accessURL": "https://download-test-qa-pre-a-hub.hubqa.arcgis.com/datasets/f4bcc1035b7d46cba95e977f4affb6be_0.zip?outSR=%7B%22latestWkid%22%3A3857%2C%22wkid%22%3A102100%7D"
        }
      ],
      "spatial": "-121.118,38.7754,-119.009,39.359",
      "theme": [
        "geospatial"
      ]
    }
  ]
}
```

See the [DCAT-US specification](https://resources.data.gov/resources/dcat-us/) for more information.

## Use
Visit the [KoopJS docs](https://github.com/koopjs/koop-output-dcat-ap-201) for instructions on building and deploying a Koop app.

This package relies on the [config](https://www.npmjs.com/package/config) package for specifying configurations. Configure your ArcGIS Online environment by adding a file at `your-project/config/default.json`:
```js
{
  "arcgisPortal": "https://www.arcgis.com" // or qaext or devext depending on which env you want
}
```

**Important!** This plugin requires the [`@koopjs/koop-provider-hub-search`](https://github.com/koopjs/koop-provider-hub-search) provider to function.

## Develop
```sh
# clone and install dependencies
git clone https://github.com/koopjs/koop-output-dcat-ap-201
cd koop-output-dcat-ap-201
npm i

# starts the example Koop app found in ./example-app.
npm run dev
```

## Test
Run the `npm t` commmand to spin up the automated tests.



[ts-badge]: https://img.shields.io/badge/TypeScript-4.3-blue.svg
[nodejs-badge]: https://img.shields.io/badge/Node.js->=%2014.16-blue.svg
[nodejs]: https://nodejs.org/dist/latest-v14.x/docs/api/
[gha-badge]: https://github.com/koopjs/koop-output-dcat-ap-201/actions/workflows/nodejs.yml/badge.svg
[gha-ci]: https://github.com/koopjs/koop-output-dcat-ap-201/actions/workflows/nodejs.yml
[typescript]: https://www.typescriptlang.org/
[typescript-4-3]: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-3.html
[license-badge]: https://img.shields.io/badge/license-APLv2-blue.svg
[license]: https://github.com/koopjs/koop-output-dcat-ap-201/blob/main/LICENSE
