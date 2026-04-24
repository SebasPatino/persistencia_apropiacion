import pool from "../config/db.js";
import bcrypt from "bcryptjs";

const UserModel = {
  // Buscar usuario por email (para el login)
  async findByEmail(email) {
    const [rows] = await pool.query(
      "SELECT id, name, email, password, role FROM users WHERE email = ?",
      [email]
    );
    return rows[0] || null;
  },

  // Buscar usuario por ID (para el refresh token)
  async findById(id) {
    const [rows] = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = ?",
      [id]
    );
    return rows[0] || null;
  },

  // ─────────────────────────────────────────────────────────────
  // findByIdWithPermissions — "El Radio de Seguridad" (Punto C)
  //
  // Consulta la BD para obtener el usuario + su rol + permisos
  // atómicos desde las tablas roles y permissions.
  //
  // Relación M:N:
  //   users → role_id → roles → role_permissions → permissions
  //
  // Implementa la "Situación 1" de la guía:
  //   El guardia usa el radio (BD) en tiempo real en lugar de
  //   confiar solo en la manilla (el token).
  // ─────────────────────────────────────────────────────────────
  async findByIdWithPermissions(userId) {
    const [rows] = await pool.query(
      `SELECT
         u.id,
         u.name,
         u.email,
         u.role,
         r.name        AS role_name,
         r.description AS role_description,
         p.code        AS permission_code,
         p.description AS permission_description
       FROM users u
       LEFT JOIN roles            r  ON u.role_id       = r.id
       LEFT JOIN role_permissions rp ON r.id             = rp.role_id
       LEFT JOIN permissions      p  ON rp.permission_id = p.id
       WHERE u.id = ?`,
      [userId]
    );

    if (!rows.length) return null;

    // El JOIN produce una fila por permiso; las consolidamos en un objeto
    const firstRow = rows[0];
    return {
      id:    firstRow.id,
      name:  firstRow.name,
      email: firstRow.email,
      role:  firstRow.role,
      roleInfo: {
        name:        firstRow.role_name,
        description: firstRow.role_description,
      },
      // Lista de permisos: ['products.read', 'categories.read', ...]
      permissions: rows
        .filter((r) => r.permission_code !== null)
        .map((r) => ({
          code:        r.permission_code,
          description: r.permission_description,
        })),
    };
  },

  // ─────────────────────────────────────────────────────────────
  // create — acepta un rol opcional ('admin' | 'user')
  // Si no se pasa rol, asigna 'user' por defecto (principio de menor privilegio)
  // ─────────────────────────────────────────────────────────────
  async create({ name, email, password, role = "user" }) {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Validar que el rol exista en la BD antes de insertarlo
    const allowedRoles = ["admin", "user"];
    const safeRole = allowedRoles.includes(role) ? role : "user";

    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, role, role_id)
       VALUES (?, ?, ?, ?, (SELECT id FROM roles WHERE name = ?))`,
      [name, email, hashedPassword, safeRole, safeRole]
    );

    return { id: result.insertId, name, email, role: safeRole };
  },

  // ─────────────────────────────────────────────────────────────
  // getAll — solo para admins: lista todos los usuarios del sistema
  // No devuelve passwords por seguridad
  // ─────────────────────────────────────────────────────────────
  async getAll() {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, r.name AS role_name, u.created_at
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       ORDER BY u.id ASC`
    );
    return rows;
  },
};

export { UserModel };