import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import bcrypt from "bcrypt";
import type { Result } from './types.js';

const db = await open({
  filename: './db.sqlite',
  driver: sqlite3.Database,
});

/*
* Función para iniciar sesión de usuario.
* Devuelve un objeto Result
*/
export async function DBUserLogin(username: string, password: string): Promise<Result> {
  const result = await db.get('SELECT * FROM User WHERE username = ?', [username]);

  if (!result) {
    console.log("[DB] (DB) Usuario no encontrado:", { username });
    return { success: false, reason: "Usuario no encontrado" };
  }

  const isMatch = await bcrypt.compare(password, result.password);

  if (isMatch) {
    console.log("[DB] Usuario autenticado:", { username });
    return { success: true };
  } else {
    console.log("[DB] (HASH) Contraseña incorrecta:", { username });
    return { success: false, reason: "Contraseña incorrecta" };
  }
}

/*
* Función para registrar un nuevo usuario.
* Devuelve un objeto Result
*/
export async function DBUserRegister(username: string, password: string): Promise<Result> {
  const usernameAlreadyExists = await db.get('SELECT * FROM User WHERE username = ?', [username]);

  if (usernameAlreadyExists) {
    console.log("[DB] (DB) El usuario ya existe:", { username });
    return { success: false, reason: "El usuario ya existe" };
  }

  const passwordHashed = await bcrypt.hash(password, 10);
  const result = await db.run('INSERT INTO User (username, password) VALUES (?, ?)', [username, passwordHashed]);

  if (result) {
    console.log("[DB] Usuario registrado en la base de datos:", { username });
    return { success: true };
  } else {
    return { success: false, reason: "Error al registrar usuario" };
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
