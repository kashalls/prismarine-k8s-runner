import { io } from 'socket.io-client'

const socket = io(`wss://${process.env.CONTROLLER_HOST}:${process.env.CONTROLLER_PORT}/runners/ws`)
export default socket;

// client-side
socket.on("connect", () => {
  console.log(socket.id); // x8WIv7-mJelg7on_ALbx
});

socket.on("disconnect", () => {
  console.log(socket.id); // undefined
});
