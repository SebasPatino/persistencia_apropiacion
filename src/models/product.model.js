import pool from "../config/db.js";

export const ProductModel = {
  findAll: async () => {
    const [rows] = await pool.query("SELECT * FROM products");
    return rows;
  },

  findById: async (id) => {
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [id]);
    return rows[0];
  },

  // Usamos category_id (nombre correcto en la BD después de la corrección)
  findByCategoryId: async (categoryId) => {
    const [rows] = await pool.query(
      "SELECT * FROM products WHERE category_id = ?",
      [categoryId]
    );
    return rows;
  },

  create: async (newProduct) => {
    const { name, category_id, price } = newProduct;

    const [result] = await pool.query(
      "INSERT INTO products (name, category_id, price) VALUES (?, ?, ?)",
      [name, category_id, price]
    );

    const [createdProduct] = await pool.query(
      "SELECT * FROM products WHERE id = ?",
      [result.insertId]
    );
    return createdProduct[0];
  },

  update: async (id, updatedFields) => {
    const { name, category_id, price } = updatedFields;

    // CORREGIDO: faltaba una coma entre category_id y price
    const [result] = await pool.query(
      "UPDATE products SET name = ?, category_id = ?, price = ? WHERE id = ?",
      [name, category_id, price, id]
    );

    if (result.affectedRows === 0) return null;

    const [updatedProduct] = await pool.query(
      "SELECT * FROM products WHERE id = ?",
      [id]
    );
    return updatedProduct[0];
  },

  delete: async (id) => {
    const [result] = await pool.query("DELETE FROM products WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },
};