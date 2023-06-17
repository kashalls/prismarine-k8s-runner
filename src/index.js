import * as mineflayer from 'mineflayer'
import * as autoEat from 'mineflayer-auto-eat'
import * as pathfinder from 'mineflayer-pathfinder'
import * as prismaviewer from 'prismarine-viewer'
import * as minecraftData from 'minecraft-data'
import { io } from "socket.io-client";
import os from 'node:os'
console.log(process.env)

async function whatismyip() {
  const ranges = os.networkInterfaces()
  return ranges['eth0'].find((int) => int.internal === false && int.family === 'IPv4').address
}

console.log(`My IP Is: ${whatismyip}`)

const unparsedConfig = process.env.MINEFLAYER_CONFIG
if (unparsedConfig.constructor !== String || unparsedConfig.length === 0 ) {
  throw Error('Environmental Variable \'MINEFLAYER_CONFIG\' must be a string.')
}

const config = JSON.parse(unparsedConfig)
if (Object.keys(config).length === 0) {
  throw Error('MINEFLAYER_CONFIG is empty.')
}

const bot = mineflayer.createBot(config)
bot.loadPlugin(pathfinder.pathfinder)
bot.loadPlugin(autoEat.plugin)

bot.on('spawn', () => {
  prismaviewer(bot, { port: 3060 })

  bot.on('path_update', (r) => {
    const nodesPerTick = (r.visitedNodes * 50 / r.time).toFixed(2)
    console.log(`I can get there in ${r.path.length} moves. Computation took ${r.time.toFixed(2)} ms (${nodesPerTick} nodes/tick). ${r.status}`)
    const path = [bot.entity.position.offset(0, 0.5, 0)]
    for (const node of r.path) {
      path.push({ x: node.x, y: node.y + 0.5, z: node.z })
    }
    bot.viewer.drawLine('path', path, 0xff00ff)
  })

  const mcData = minecraftData(bot.version)
  const defaultMove = new Movements(bot, mcData)

  bot.viewer.on('blockClicked', (block, face, button) => {
    if (button !== 2) return // only right click

    const p = block.position.offset(0, 1, 0)

    bot.pathfinder.setMovements(defaultMove)
    bot.pathfinder.setGoal(new GoalBlock(p.x, p.y, p.z))
  })
})

bot.on('message', (message) => {
  console.log(message.toAnsi())
})
