const fs = require("fs");
const path = require("path");

class ProductManager {
  constructor() {
    this.path = path.join(__dirname, "../data/products.json");
  }

  async readFile() {
    try {
      const data = await fs.promises.readFile(this.path, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async getProducts() {
    return await this.readFile();
  }

  async getProductById(id) {
    const products = await this.readFile();
    const product = products.find((prod) => prod.id === id);
    if (!product) return null;
    return product;
  }

  async addProduct(productData) {
    const products = await this.readFile();

    const { title, description, code, price, stock, category } = productData;
    if (!title || !description || !code || !price || !stock || !category) {
      throw new Error("Todos los campos son obligatorios");
    }

    if (products.some((prod) => prod.code === code)) {
      throw new Error("El código del producto ya existe");
    }

    const newId =
      products.length > 0 ? products[products.length - 1].id + 1 : 1;

    const newProduct = {
      id: newId,
      status: true,
      thumbnails: productData.thumbnails || [],
      ...productData,
    };

    products.push(newProduct);
    await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
    return newProduct;
  }

  async updateProduct(id, updates) {
    const products = await this.readFile();
    const index = products.findIndex((prod) => prod.id === id);

    if (index === -1) return null;

    const { id: _, ...rest } = updates;

    products[index] = { ...products[index], ...rest };

    await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
    return products[index];
  }

  async deleteProduct(id) {
    const products = await this.readFile();
    const newProducts = products.filter((prod) => prod.id !== id);

    if (products.length === newProducts.length) return false;

    await fs.promises.writeFile(
      this.path,
      JSON.stringify(newProducts, null, 2)
    );
    return true;
  }
}

module.exports = ProductManager;
