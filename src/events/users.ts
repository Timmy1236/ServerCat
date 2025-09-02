// events/users.ts
import { Server, Socket } from "socket.io";

export function registerUserEvents(
  io: Server,
  socket: Socket,
  users: Record<string, { username: string }>
) {
  /*
   * Manejo de desconexiones
   */
  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (!user) return;

    console.log("[DESCONECTADO]:", user.username);
    delete users[socket.id];

    io.emit("chatMessage", { from: "System", text: `${user.username} ha salido del chat.` });
    io.emit("userList", getUserList(users));
  });

  /*
   * Lista de usuarios
   */
  socket.on("getUserList", () => {
    socket.emit("userList", getUserList(users));
  });
}

function getUserList(users: Record<string, { username: string }>) {
  return Object.entries(users).map(([id, u]) => ({ id, username: u.username }));
}
