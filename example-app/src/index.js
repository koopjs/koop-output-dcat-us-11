const config = require('config')
const Koop = require('koop')
const plugins = require('./plugins')

// initiate a koop app
const koop = new Koop()

// register koop plugins
plugins.forEach((plugin) => {
  koop.register(plugin.instance, plugin.options)
})

// start the server
koop.server.listen(config.port, () => koop.log.info(`Koop server listening at ${config.port}`))
