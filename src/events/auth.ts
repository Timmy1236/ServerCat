// events/auth.ts
import { Server, Socket } from "socket.io";
import { DBUserLogin, DBUserRegister } from "../db.js";

export function registerAuthEvents(
  io: Server,
  socket: Socket,
  users: Record<string, { username: string }>
) {
  /*
   * Manejo de inicio de sesión de usuario
   */
  socket.on("login", async (username: string, password: string) => {
    if (Object.values(users).some((u) => u.username === username)) {
      socket.emit("loginResult", { success: false, reason: "Usuario ya conectado" });
      return;
    }

    const isAuthenticated = await DBUserLogin(username, password);

    if (isAuthenticated.success) {
      users[socket.id] = { username };
      socket.emit("loginResult", { success: true });

      io.emit("chatMessage", { from: "System", text: `${username} se ha unido al chat.` });
      io.emit("userList", getUserList(users));
    } else {
      socket.emit("loginResult", { success: false, reason: "Credenciales inválidas" });
    }
  });

  /*
   * Manejo de registro de usuario
   */
  socket.on("register", async (username: string, password: string) => {
    if (username === "System") {
      socket.emit("registerResult", { success: false, reason: "Nombre reservado" });
      return;
    }

    const isRegistered = await DBUserRegister(username, password);
    socket.emit("registerResult", isRegistered);
  });
}

function getUserList(users: Record<string, { username: string }>) {
  return Object.entries(users).map(([id, u]) => ({ id, username: u.username }));
}
