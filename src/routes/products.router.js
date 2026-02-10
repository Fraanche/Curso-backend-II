const express = require("express");
const productModel = require("../dao/models/product.model");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let { limit = 10, page = 1, sort, query } = req.query;

    let filter = {};
    if (query) {
      filter = {
        $or: [{ category: query }, { status: query.toLowerCase() === "true" }],
      };
    }

    let options = {
      limit: parseInt(limit),
      page: parseInt(page),
      lean: true,
    };

    if (sort === "asc") {
      options.sort = { price: 1 };
    } else if (sort === "desc") {
      options.sort = { price: -1 };
    }

    const result = await productModel.paginate(filter, options);

    const baseUrl = "/api/products";
    const queryParams = [];
    if (limit) queryParams.push(`limit=${limit}`);
    if (sort) queryParams.push(`sort=${sort}`);
    if (query) queryParams.push(`query=${query}`);
    const queryString = queryParams.join("&");

    const prevLink = result.hasPrevPage
      ? `${baseUrl}?page=${result.prevPage}&${queryString}`
      : null;
    const nextLink = result.hasNextPage
      ? `${baseUrl}?page=${result.nextPage}&${queryString}`
      : null;

    res.json({
      status: "success",
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: prevLink,
      nextLink: nextLink,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "error", error: "Error interno del servidor" });
  }
});

router.get("/:pid", async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid);
    if (!product)
      return res
        .status(404)
        .json({ status: "error", error: "Producto no encontrado" });
    res.json({ status: "success", payload: product });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const newProduct = await productModel.create(req.body);
    res.status(201).json({ status: "success", payload: newProduct });
  } catch (error) {
    res.status(400).json({ status: "error", error: error.message });
  }
});

router.put("/:pid", async (req, res) => {
  try {
    const updatedProduct = await productModel.findByIdAndUpdate(
      req.params.pid,
      req.body,
      { new: true }
    );
    if (!updatedProduct)
      return res
        .status(404)
        .json({ status: "error", error: "Producto no encontrado" });
    res.json({ status: "success", payload: updatedProduct });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

router.delete("/:pid", async (req, res) => {
  try {
    const deletedProduct = await productModel.findByIdAndDelete(req.params.pid);
    if (!deletedProduct)
      return res
        .status(404)
        .json({ status: "error", error: "Producto no encontrado" });
    res.json({
      status: "success",
      message: "Producto eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

module.exports = router;
