export const Heartbeat = {
  op: 3
}

export const Authorization = {
  op: 2,
  d: {
    k: process.env.SHARED_KEY
  }
}
