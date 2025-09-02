import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import bcrypt from "bcrypt";

const db = await open({
  filename: './db.sqlite',
  driver: sqlite3.Database,
});

/*
* Función para iniciar sesión de usuario.
* Devuelve true si el usuario y la contraseña son correctos, false en caso contrario
*/
export async function DBUserLogin(username: string, password: string) {
  const result = await db.get('SELECT * FROM User WHERE username = ?', [username])

  if (result) {
    const isMatch: boolean = await bcrypt.compare(password, result.password);

    if (isMatch) {
      console.log("[DB] Usuario autenticado:", { username });
      return true;
    } else {
      console.log("[DB] (HASH) Fallo en la autenticación:", { username });
      return false;
    }
  } else {
    console.log("[DB] (DB) Fallo en la autenticación:", { username });
    return false;
  }
}

/*
* Función para registrar un nuevo usuario.
* Devuelve true si el registro es exitoso, false en caso contrario
*/
export async function DBUserRegister(username: string, password: string) {
  const usernameAlreadyExists = await db.get('SELECT * FROM User WHERE username = ?', [username]);

  if (usernameAlreadyExists) {
    console.log("[DB] (DB) El usuario ya existe:", { username });
    return false;
  }

  const passwordHashed = await bcrypt.hash(password, 10);
  const result = await db.run('INSERT INTO User (username, password) VALUES (?, ?)', [username, passwordHashed]);

  if (result) {
    console.log("[DB] Usuario registrado en la base de datos:", { username });
    return true;
  } else {
    return false;
  }
}

/*
* Crear la tabla de usuarios en caso que no exista.
*/
export async function DBInitialize() {
  db.run(`
  CREATE TABLE IF NOT EXISTS User (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT,
    UNIQUE (username)
  )
`);
}