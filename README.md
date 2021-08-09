# Koop Provider DCAT-US 1.1

[![TypeScript version][ts-badge]][typescript-4-3]
[![Node.js version][nodejs-badge]][nodejs]
[![APLv2][license-badge]][license]
[![Build Status - GitHub Actions][gha-badge]][gha-ci]

This is a Koop output plugin that transforms datasets from the ArcGIS Hub Search API into a DCAT-US 1.1 feed encoded in JSON. It currently only supports exporting a search catalog from an entire Hub Site.

Here is an example feed:
```json
TODO
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
