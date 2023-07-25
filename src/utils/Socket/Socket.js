import WebSocket from 'ws'
import Constants from './Constants.js'
import { isNotObject, tryParseJSON } from './Utils.js'

const socketAddress = `ws://${process.env.CONTROLLER_HOST}/`
export const ws = new WebSocket(socketAddress)

ws.on('error', (error) => {
  if (ws.heartbeatInterval) {
    clearInterval(ws.heartbeatInterval)
  }
  console.log(error)
})

ws.on('close', (code) => {
  if (ws.heartbeatInterval) {
    clearInterval(ws.heartbeatInterval)
  }
  console.log(`WS Closed: ${code}`)
})

ws.on('message', (rawData) => {
  const message = rawData.toString()
  const data = tryParseJSON(message)
  if (!data || isNotObject(data)) {
    console.log(`[WebSocket] Recieved invalid response from socket:\n[Buffer] ${rawData}\n[Decoded] ${message}`)
    return ws.close(4006, 'invalid_payload')
  }
  console.log(`[Debug] ${JSON.stringify(data)}`)

  if (!('op' in data) || !('d' in data)) {
    console.log(`[WebSocket] Recieved json with invalid format from socket:\n[Decoded] ${JSON.stringify(data)}`)
    return ws.close(4006, 'invalid_payload')
  }

  switch (data.op) {
    // Hello
    case 1:
      // Handle Heartbeat
      if (!('heartbeat_interval' in data.d)) {
        console.log(`[WebSocket] Recieved invalid opcode 1 data: ${JSON.stringify(data)}`)
      }
      send(Constants.Heartbeat)
      ws.heartbeatInterval = setInterval(() => send(Constants.Heartbeat), data.d.heartbeat_interval)

      // Begin Authorization
      send(Constants.Authorization)
      break;
    case 0:
      if (!('t') in data) {
        console.log(`[WebSocket] Recieved invalid opcode 0 without type present: ${JSON.stringify(data)}`)
        return ws.close(4005, 'requires_type_string')
      }
      // Not sure what to add here tho so..
      break;
  }
})

export function send (message) {
  if (isNotObject(message)) {
    const parsed = tryParseJSON(message)
    if (!parsed) {
      return console.log('Cannot send non-valid json. Canceling.')
    }
    return ws.send(JSON.stringify(parsed))
  }
  return ws.send(JSON.stringify(message))
}
