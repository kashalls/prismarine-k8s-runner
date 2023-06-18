import * as mineflayer from 'mineflayer'
import * as autoEat from 'mineflayer-auto-eat'
import g, { Movements, pathfinder } from 'mineflayer-pathfinder'
import { mineflayer as mineflayerViewer } from 'prismarine-viewer'
import mcdata from 'minecraft-data'
import os from 'node:os'
import { v4 as uuid } from 'uuid'

import socket from './socket.js'

const GoalBlock = g.goals.GoalBlock

const info = {
  ip: os.networkInterfaces()['eth0'].find((ip) => ip.internal === false && ip.family === 'IPv4').address,
  podId: uuid(),
  controller: {
    host: process.env.CONTROLLER_HOST,
    port: process.env.CONTROLLER_PORT || 8999,
  },
  viewer: {
    port: process.env.VIEWER_PORT || 3060
  },
}

console.log(process.env, info)
const unparsedConfig = process.env.MINEFLAYER_CONFIG
if (unparsedConfig.constructor !== String || unparsedConfig.length === 0 ) {
  throw Error('Environmental Variable \'MINEFLAYER_CONFIG\' must be a string.')
}

const config = JSON.parse(unparsedConfig)
console.log(`Mineflayer Config: ${config}`)
if (Object.keys(config).length === 0) {
  throw Error('MINEFLAYER_CONFIG is empty.')
}

const bot = mineflayer.createBot(config)
bot.loadPlugin(pathfinder)
bot.loadPlugin(autoEat.plugin)

bot.on('spawn', () => {
  socket.emit('bot-data', info)
  mineflayerViewer(bot, { port: info.viewer.port })

  bot.on('path_update', (r) => {
    const nodesPerTick = (r.visitedNodes * 50 / r.time).toFixed(2)
    console.log(`I can get there in ${r.path.length} moves. Computation took ${r.time.toFixed(2)} ms (${nodesPerTick} nodes/tick). ${r.status}`)
    const path = [bot.entity.position.offset(0, 0.5, 0)]
    for (const node of r.path) {
      path.push({ x: node.x, y: node.y + 0.5, z: node.z })
    }
    bot.viewer.drawLine('path', path, 0xff00ff)
  })

  const mcData = mcdata(bot.version)
  const defaultMove = new Movements(bot, mcData)

  bot.viewer.on('blockClicked', (block, face, button) => {
    console.log(`button clicked: ${button}`)
    if (button !== 2) return // only right click

    const p = block.position.offset(0, 1, 0)

    bot.pathfinder.setMovements(defaultMove)
    bot.pathfinder.setGoal(new GoalBlock(p.x, p.y, p.z))
  })
})

bot.on('message', (message) => {
  console.log(message.toAnsi())
})

bot.on('err', (err) => {
  console.log(err)
  process.exit(1)
})


