import { Router } from "express";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";

const router = Router();

router.get("/", (req, res) => {
  res.redirect("/products");
});

router.get("/products", async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  const products = await Product.find()
    .limit(limit)
    .skip((page - 1) * limit)
    .lean();

  const totalProducts = await Product.countDocuments();

  const totalPages = Math.ceil(totalProducts / limit);

  res.render("products", {
    products,
    page,
    totalPages,
    hasPrevPage: page > 1,
    hasNextPage: page < totalPages,
    prevPage: page - 1,
    nextPage: page + 1,
    limit,
  });
});

router.get("/products/new", (req, res) => {
  res.render("newProduct");
});

router.get("/products/:pid", async (req, res) => {
  const product = await Product.findById(req.params.pid).lean();
  if (!product) return res.status(404).send("Producto no encontrado");
  res.render("productDetail", { product });
});

router.get("/carts/:cid", async (req, res) => {
  const { cid } = req.params;

  try {
    const cart = await Cart.findById(cid).populate("products.product");

    if (!cart) return res.status(404).send("Carrito no encontrado");

    res.render("cart", { cart: cart.toObject() });
  } catch (err) {
    console.error("Error al obtener el carrito:", err);
    res.status(500).send("Error interno del servidor");
  }
});

router.post("/products/new", async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      stock,
      code,
      status,
      thumbnails,
    } = req.body;

    const thumbnailsArray = thumbnails
      ? thumbnails.split(",").map((s) => s.trim())
      : [];

    const newProduct = new Product({
      title,
      description,
      price,
      category,
      stock,
      code,
      status: status === "true" || status === true,
      thumbnails: thumbnailsArray,
    });

    await newProduct.save();
    res.redirect("/products");
  } catch (error) {
    console.error("Error creando producto:", error);
    res.status(500).send("Error al crear el producto");
  }
});

export default router;
