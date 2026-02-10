const fs = require("fs");
const path = require("path");

class CartManager {
  constructor() {
    this.path = path.join(__dirname, "../data/carts.json");
  }

  async readFile() {
    try {
      const data = await fs.promises.readFile(this.path, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async createCart() {
    const carts = await this.readFile();
    const newId = carts.length > 0 ? carts[carts.length - 1].id + 1 : 1;

    const newCart = {
      id: newId,
      products: [],
    };

    carts.push(newCart);
    await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
    return newCart;
  }

  async getCartById(id) {
    const carts = await this.readFile();
    const cart = carts.find((c) => c.id === id);
    return cart || null;
  }

  async addProductToCart(cartId, productId) {
    const carts = await this.readFile();
    const cartIndex = carts.findIndex((c) => c.id === cartId);

    if (cartIndex === -1) return null;

    const cart = carts[cartIndex];

    const existingProductIndex = cart.products.findIndex(
      (p) => p.product === Number(productId)
    );

    if (existingProductIndex !== -1) {
      cart.products[existingProductIndex].quantity += 1;
    } else {
      cart.products.push({
        product: Number(productId),
        quantity: 1,
      });
    }

    carts[cartIndex] = cart;
    await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
    return cart;
  }
}

module.exports = CartManager;
