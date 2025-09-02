// events/chat.ts
import { Server, Socket } from "socket.io";

export function registerChatEvents(
  io: Server,
  socket: Socket,
  users: Record<string, { username: string }>
) {
  /*
   * Manejo de mensajes de chat
   */
  socket.on("chatMessage", (text: string) => {
    const user = users[socket.id];
    if (!user) return;

    console.log("[CHAT] Mensaje recibido:", { from: user.username, text });

    io.emit("chatMessage", { from: user.username, text });
  });
}
