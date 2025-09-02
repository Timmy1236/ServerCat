import { Server } from "socket.io";
import { DBUserLogin, DBUserRegister, DBInitialize } from "./db.js";

const PORT = 11000;
const io = new Server(PORT);

// Diccionario para mantener los usuarios que se conectaron al servidor
const users: Record<string, { username: string }> = {};

DBInitialize();

io.on("connection", (socket) => {
  console.log("[CONEXIÓN] Cliente conectado:", socket.id);

  /*
  * Manejo de inicio de sesión de usuario
  */
  socket.on("login", async (username: string, password: string) => {
    // Evitar múltiples sesiones con el mismo usuario
    if (Object.values(users).some((u) => u.username === username)) {
      socket.emit("loginResult", false);
      return;
    }

    const isAuthenticated = await DBUserLogin(username, password);

    if (isAuthenticated) {
      // Guardar usuario y avisar al cliente
      users[socket.id] = { username };
      socket.emit("loginResult", true);

      // Notificar a todos los clientes ya logeados del nuevo usuario ingresado
      updateUserList();
      io.emit("chatMessage", { from: "System", text: `${username} se ha unido al chat.` });
    } else {
      socket.emit("loginResult", false);
    }
  });

  /*
  * Manejo de registro de usuario
  */
  socket.on("register", async (username: string, password: string) => {
    // Prevenir registro con el nombre reservado "System"
    if (username === "System") {
      socket.emit("registerResult", false);
      return;
    }

    const isRegistered = await DBUserRegister(username, password);
    socket.emit("registerResult", isRegistered);
  });

  /*
  * Manejo de mensajes de chat
  */
  socket.on("chatMessage", (text: string) => {
    const user = users[socket.id];
    if (!user) return;

    console.log("[CHAT] Mensaje recibido:", { from: user.username, text });

    io.emit("chatMessage", { from: user.username, text });
  });

  /*
  * Manejo de desconexiones
  */
  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (!user) return;

    console.log("[DESCONECTADO]:", user.username);

    // Eliminar usuario de la lista
    delete users[socket.id];

    // Notificar al chat
    io.emit("chatMessage", { from: "System", text: `${user.username} ha salido del chat.` });

    updateUserList();
  });

  /*
  * Permitir a los clientes solicitar la lista de usuarios
  */
  socket.on("getUserList", () => {
    updateUserList();
  });
});

/*
* Genera y envía la lista de usuarios conectados a todos los clientes
*/
function updateUserList() {
  const userList = Object.entries(users).map(([id, u]) => ({ id, username: u.username }));
  io.emit("userList", userList);
}

console.log("    |\\__\/,|   (`\\\r\n  _.|o o  |_   ) )\r\n-(((---(((--------")
console.log(`ServerCat esta observando el puerto: ${PORT}`);