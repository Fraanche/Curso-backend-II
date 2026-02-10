const express = require("express");
const cartModel = require("../dao/models/cart.model");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const newCart = await cartModel.create({ products: [] });
    res.status(201).json({ status: "success", payload: newCart });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    const cart = await cartModel.findById(req.params.cid);

    if (!cart) {
      return res
        .status(404)
        .json({ status: "error", error: "Carrito no encontrado" });
    }

    res.json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await cartModel.findById(cid);

    if (!cart)
      return res
        .status(404)
        .json({ status: "error", error: "Carrito no encontrado" });

    const productIndex = cart.products.findIndex(
      (p) => p.product._id.toString() === pid
    );

    if (productIndex !== -1) {
      cart.products[productIndex].quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await cart.save();

    res.json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await cartModel.findById(cid);

    if (!cart)
      return res
        .status(404)
        .json({ status: "error", error: "Carrito no encontrado" });

    const newProducts = cart.products.filter(
      (p) => p.product._id.toString() !== pid
    );
    cart.products = newProducts;

    await cart.save();

    res.json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

router.put("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;

    const cart = await cartModel.findByIdAndUpdate(
      cid,
      { products: products },
      { new: true }
    );

    if (!cart)
      return res
        .status(404)
        .json({ status: "error", error: "Carrito no encontrado" });

    res.json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    const cart = await cartModel.findById(cid);

    if (!cart)
      return res
        .status(404)
        .json({ status: "error", error: "Carrito no encontrado" });

    const productIndex = cart.products.findIndex(
      (p) => p.product._id.toString() === pid
    );

    if (productIndex !== -1) {
      cart.products[productIndex].quantity = quantity;
      await cart.save();
      res.json({ status: "success", payload: cart });
    } else {
      res
        .status(404)
        .json({
          status: "error",
          error: "Producto no encontrado en el carrito",
        });
    }
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

router.delete("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    const cart = await cartModel.findByIdAndUpdate(
      cid,
      { products: [] },
      { new: true }
    );

    if (!cart)
      return res
        .status(404)
        .json({ status: "error", error: "Carrito no encontrado" });

    res.json({ status: "success", message: "Carrito vaciado exitosamente" });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

module.exports = router;
