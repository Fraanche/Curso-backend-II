const express = require("express");
const userModel = require("../dao/models/user.model");
const cartModel = require("../dao/models/cart.model");
const { createHash, isValidPassword } = require("../utils");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;

    const exists = await userModel.findOne({ email });
    if (exists)
      return res
        .status(400)
        .send({ status: "error", error: "El usuario ya existe" });

    const newCart = await cartModel.create({ products: [] });

    const user = {
      first_name,
      last_name,
      email,
      age,
      password: createHash(password),
      cart: newCart._id,
      role: "user",
    };

    const result = await userModel.create(user);
    res.send({ status: "success", payload: result });
  } catch (error) {
    res.status(500).send({ status: "error", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user)
      return res
        .status(400)
        .send({ status: "error", error: "Usuario no encontrado" });

    if (!isValidPassword(user, password))
      return res
        .status(403)
        .send({ status: "error", error: "Contraseña incorrecta" });

    const userToken = {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      age: user.age,
      role: user.role,
      cart: user.cart,
    };

    const token = jwt.sign(userToken, "coderSecret", { expiresIn: "24h" });

    res
      .cookie("jwtCookieToken", token, {
        maxAge: 60 * 60 * 1000 * 24,
        httpOnly: true,
      })
      .send({ status: "success", message: "Logueado correctamente" });
  } catch (error) {
    res.status(500).send({ status: "error", error: error.message });
  }
});

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.send({ status: "success", payload: req.user });
  }
);

module.exports = router;
