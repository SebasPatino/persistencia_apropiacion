import pool from "../database/connection.js";

export const CategoryModel = {

  findAll: async () => {
    const [rows] = await pool.query("SELECT * FROM categories");
    return rows;
  },

  findById: async (id) => {
    const [rows] = await pool.query(
      "SELECT * FROM categories WHERE id = ?", [id]
    );
    return rows[0]; // Retorna el objeto o undefined
  },

  create: async ({ name }) => {
    const [result] = await pool.query(
      "INSERT INTO categories (name) VALUES (?)", [name]
    );
    return { id: result.insertId, name };
  },

  update: async (id, { name }) => {
    const [result] = await pool.query(
      "UPDATE categories SET name = ? WHERE id = ?", [name, id]
    );
    if (result.affectedRows === 0) return null;
    return { id, name };
  },

  delete: async (id) => {
    const [result] = await pool.query(
      "DELETE FROM categories WHERE id = ?", [id]
    );
    return result.affectedRows > 0;
  },
};