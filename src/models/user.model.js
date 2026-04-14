import pool from "../config/db.js";
import bcrypt from "bcryptjs";

const UserModel = {
  // ───────────────────────────────────────────
  // Buscar usuario por email (para el login)
  // ───────────────────────────────────────────
  async findByEmail(email) {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    return rows[0] || null;
  },

  // ───────────────────────────────────────────
  // Crear usuario encriptando la contraseña
  // ───────────────────────────────────────────
  async create({ name, email, password }) {
    // 🔐 Encriptar la contraseña ANTES de guardarla
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    return { id: result.insertId, name, email };
  },
};

export { UserModel };