# CHANGELOG.md

## Unreleased
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