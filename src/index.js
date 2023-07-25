import * as mineflayer from 'mineflayer'
import * as autoEat from 'mineflayer-auto-eat'
import g, { Movements, pathfinder } from 'mineflayer-pathfinder'
import { mineflayer as mineflayerViewer } from 'prismarine-viewer'
import mcdata from 'minecraft-data'

import { send } from './utils/Socket/Socket.js'
import { parseConfig } from './utils/Utils.js'
import MongoCache, { client } from './utils/MongoCache.js'

const GoalBlock = g.goals.GoalBlock

console.log(process.env, info)
const config = parseConfig()

(async () => await client.connect())

const bot = mineflayer.createBot({ ...config, profilesFolder: (cache) => new MongoCache(cache) })
bot.loadPlugin(pathfinder)
bot.loadPlugin(autoEat.plugin)

bot.on('spawn', () => {
  socket.emit('botinfo', info)
  mineflayerViewer(bot, { port: 8080 })

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
  socket.broadcast(message)
})

bot.on('err', (err) => {
  console.log(err)
  process.exit(1)
})


