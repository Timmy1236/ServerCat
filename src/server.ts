import { Server } from "socket.io";
import { DBInitialize } from "./db.js";
import { registerAuthEvents } from "./events/auth.js";
import { registerChatEvents } from "./events/chat.js";
import { registerUserEvents } from "./events/users.js";

const PORT = 11000;
const io = new Server(PORT);

// Diccionario para mantener usuarios conectados
const users: Record<string, { username: string }> = {};

DBInitialize();

io.on("connection", (socket) => {
  console.log("[CONEXIÓN] Cliente conectado:", socket.id);

  registerAuthEvents(io, socket, users);
  registerChatEvents(io, socket, users);
  registerUserEvents(io, socket, users);
});

console.log("    |\\__\/,|   (`\\\r\n  _.|o o  |_   ) )\r\n-(((---(((--------")
console.log(`ServerCat observando el puerto: ${PORT}`);