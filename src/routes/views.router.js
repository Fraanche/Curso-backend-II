const express = require("express");
const productModel = require("../dao/models/product.model");
const cartModel = require("../dao/models/cart.model");

const router = express.Router();

router.get("/products", async (req, res) => {
  try {
    let { page = 1, limit = 5 } = req.query;

    const result = await productModel.paginate(
      {},
      {
        page,
        limit,
        lean: true,
      }
    );

    result.prevLink = result.hasPrevPage
      ? `/products?page=${result.prevPage}&limit=${limit}`
      : null;
    result.nextLink = result.hasNextPage
      ? `/products?page=${result.nextPage}&limit=${limit}`
      : null;

    result.isValid = !(page <= 0 || page > result.totalPages);

    res.render("products", result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al cargar productos");
  }
});

router.get("/carts/:cid", async (req, res) => {
  try {
    const cart = await cartModel.findById(req.params.cid).lean();

    if (!cart) {
      return res.status(404).send("Carrito no encontrado");
    }

    res.render("cart", { cart });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al cargar carrito");
  }
});

module.exports = router;
