import pool from "../config/db.js";
import bcrypt from "bcryptjs";

const UserModel = {
  // ───────────────────────────────────────────
  // Buscar usuario por email (para el login)
  // ───────────────────────────────────────────
  async findByEmail(email) {
    const [rows] = await pool.query(
      "SELECT id, name, email, password, role FROM users WHERE email = ?",
      [email]
    );
    return rows[0] || null;
  },

  // ───────────────────────────────────────────
  // Buscar usuario por ID (para el refresh token)
  // ───────────────────────────────────────────
  async findById(id) {
    const [rows] = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = ?",
      [id]
    );
    return rows[0] || null;
  },

  // ───────────────────────────────────────────
  // Crear usuario encriptando la contraseña
  // Principio SRP: el modelo es responsable del hashing
  // ───────────────────────────────────────────
  async create({ name, email, password }) {
    // 🔐 Encriptar la contraseña ANTES de guardarla (nunca texto plano)
    // El número 10 es el "salt rounds": más alto = más seguro pero más lento
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, "user"]
    );

    // Devolver el usuario sin la contraseña (nunca exponemos el hash)
    return { id: result.insertId, name, email, role: "user" };
  },
};

export { UserModel };