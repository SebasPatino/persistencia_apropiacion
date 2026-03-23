import productsData from "../data/products.data.js";

export const ProductModel = {
  findAll: () => {
    return productsData;
  },

  findById: (id) => {
    return productsData.find((p) => p.id === id);
  },

  // Búsqueda relacional: retorna todos los productos de una categoría
  findByCategoryId: (category_id) => {
    // Usamos .filter() porque una categoría puede tener MUCHOS productos
    // Retorna un arreglo (vacío si no hay coincidencias, o con los productos encontrados)
    return productsData.filter((p) => p.category_id === category_id);
  },

  create: (newProduct) => {
    const id = productsData.length + 1;
    const productWithId = { id, ...newProduct }; // category_id ya vendrá en newProduct
    productsData.push(productWithId);
    return productWithId;
  },

  update: (id, updatedFields) => {
    const index = productsData.findIndex((p) => p.id === id);
    if (index === -1) return null;

    productsData[index] = { ...productsData[index], ...updatedFields };
    return productsData[index];
  },

  delete: (id) => {
    const index = productsData.findIndex((product) => product.id === id);
    if (index === -1) return false;
    productsData.splice(index, 1);
    return true;
  },
};