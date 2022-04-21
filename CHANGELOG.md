# CHANGELOG.md

## Unreleased
Added
- If the `distribution` property of a site's dcat config is an array, those custom distributions will now be prepended to the distributions list [#23](https://github.com/koopjs/koop-output-dcat-us-11/pull/23)

## 1.8.2
Fixed
- Fixed access urls for downloadable distributions [#22](https://github.com/koopjs/koop-output-dcat-us-11/pull/22)

## 1.8.1
Fixed
- Fixed license issue [#21](https://github.com/koopjs/koop-output-dcat-us-11/pull/21)

## 1.8.0
Added
- Distributions for proxied CSVs now include a csv distribution [#20](https://github.com/koopjs/koop-output-dcat-us-11/pull/20)

## 1.7.0
Added
- Modified license to be editable with fallback logic if not defined [#19](https://github.com/koopjs/koop-output-dcat-us-11/pull/19)

## 1.6.0
Added
- Default undefined non-editable field values to empty string [#18](https://github.com/koopjs/koop-output-dcat-us-11/pull/18)

## 1.5.1
Fixed
- Default value is returned when custom config attempts to overwrite contactPoint['@type'] [#17](https://github.com/koopjs/koop-output-dcat-us-11/pull/17)

## 1.5.0
Added
- Handling of path hierarchies/fallback values [#16](https://github.com/koopjs/koop-output-dcat-us-11/pull/16)

## 1.4.2
Fixed
- Scrub attempts to overwrite `distribution` rather than `distributions` [#15](https://github.com/koopjs/koop-output-dcat-us-11/pull/15)

## 1.4.1
Fixed
- Add proper error status [#14](https://github.com/koopjs/koop-output-dcat-us-11/pull/14)

## 1.4.0
Fixed
- Landing page and identifier urls are now the canonical hub url for the item [#13](https://github.com/koopjs/koop-output-dcat-us-11/pull/13)
- Hub Pages included in the feed no longer have 404ing urls [#13](https://github.com/koopjs/koop-output-dcat-us-11/pull/13)

## 1.3.1
Fixed
- Fixed landingPage and identifier urls to be custom domain rather than opendata subdomain

## 1.3.0
Added
- Added spatial and theme properties [#11](https://github.com/koopjs/koop-output-dcat-us-11/pull/11)
Fixed
- Fixed license resolution [#11](https://github.com/koopjs/koop-output-dcat-us-11/pull/11)
- Fixed missing access url for geoservices [#11](https://github.com/koopjs/koop-output-dcat-us-11/pull/11)

## 1.2.2
Fixed
- Fixed dcatConfig query parameter parsing issue [#10](https://github.com/koopjs/koop-output-dcat-us-11/pull/10)

## 1.2.1
Added
- Improved performance by limiting search requests to required terms [#8](https://github.com/koopjs/koop-output-dcat-us-11/pull/8)

## 1.2.0
Added
- Custom configurations can be passed through the `dcatConfig` query param [#6](https://github.com/koopjs/koop-output-dcat-us-11/pull/6)
- The returned feed can be restricted to a single dataset with the `id` query param [#6](https://github.com/koopjs/koop-output-dcat-us-11/pull/6)

## 1.1.0
Added
- Supports custom configuration values found at `site.data.feeds.dcatUS11` [#4](https://github.com/koopjs/koop-output-dcat-us-11/pull/4)

## 1.0.1

Fixed
- License field uses `structuredLicense` URL or defaults to `null` [#3](https://github.com/koopjs/koop-output-dcat-us-11/pull/3)

## 1.0.0

Added
- Basic DCAT-US 1.1 feed generation [#1](https://github.com/koopjs/koop-output-dcat-us-11/pull/1), [#2](https://github.com/koopjs/koop-output-dcat-us-11/pull/2)