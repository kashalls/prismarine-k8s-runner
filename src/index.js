import * as mineflayer from 'mineflayer'
import * as autoEat from 'mineflayer-auto-eat'
import * as pathfinder from 'mineflayer-pathfinder'
import * as prismaviewer from 'prismarine-viewer'
import * as minecraftData from 'minecraft-data'
import { io } from "socket.io-client";

const processKey = 'PRISMARINE_'

const processEntries = Object.entries(process.env);
const filteredEntries = processEntries.filter(([key]) => key.startsWith(processKey));
const mappedEntries = filteredEntries.map(([key, value]) => [key.replace(processKey, '').toLowerCase(), value]);
const mineflayerOptions = Object.fromEntries(mappedEntries)

const bot = mineflayer.createBot(mineflayerOptions)
bot.loadPlugin(autoEat.plugin)

bot.on('message', (message) => {
  console.log(message.toAnsi())
})
