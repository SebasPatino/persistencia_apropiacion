import pool from "../database/connection.js";

export const ProductModel = {

  findAll: async () => {
    const [rows] = await pool.query("SELECT * FROM products");
    return rows;
  },

  findById: async (id) => {
    const [rows] = await pool.query(
      "SELECT * FROM products WHERE id = ?", [id]
    );
    return rows[0];
  },

  findByCategoryId: async (category_id) => {
    const [rows] = await pool.query(
      "SELECT * FROM products WHERE category_id = ?", [category_id]
    );
    return rows;
  },

  create: async ({ name, price, category_id }) => {
    const [result] = await pool.query(
      "INSERT INTO products (name, price, category_id) VALUES (?, ?, ?)",
      [name, price, category_id]
    );
    return { id: result.insertId, name, price, category_id };
  },

  update: async (id, updatedFields) => {
    const { name, price, category_id } = updatedFields;
    const [result] = await pool.query(
      "UPDATE products SET name = ?, price = ?, category_id = ? WHERE id = ?",
      [name, price, category_id, id]
    );
    if (result.affectedRows === 0) return null;
    return { id, ...updatedFields };
  },

  delete: async (id) => {
    const [result] = await pool.query(
      "DELETE FROM products WHERE id = ?", [id]
    );
    return result.affectedRows > 0;
  },
};