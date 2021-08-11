const HubSearch = require('@koopjs/koop-provider-hub-search')
const DcatOutput = require('@koopjs/koop-output-dcat-us-11')

// list different types of plugins in order
const outputs = [
  {
    instance: DcatOutput
  }
]
const auths = []
const caches = []
const plugins = [
  {
    instance: HubSearch
  }
]

module.exports = [...outputs, ...auths, ...caches, ...plugins]
