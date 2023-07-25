export function ip() {
  return Object.values(require("os").networkInterfaces())
        .flat()
        .filter((item) => !item.internal && item.family === "IPv4")
        .find(Boolean).address;
}

export function parseConfig(config) {
  const unparsedConfig = config ?? process.env.MINEFLAYER_CONFIG
  if (unparsedConfig.constructor !== String || unparsedConfig.length === 0 ) {
    throw Error('Environmental Variable \'MINEFLAYER_CONFIG\' must be a string.')
  }
  
  const config = JSON.parse(unparsedConfig)
  console.log(`Mineflayer Config: ${config}`)
  if (Object.keys(config).length === 0) {
    throw Error('MINEFLAYER_CONFIG is empty.')
  }

  return config
}
