import { Router } from "express";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const newCart = await Cart.create({ products: [] });
    res.status(201).json(newCart);
  } catch (err) {
    res.status(500).json({ error: "Error creando el carrito" });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate(
      "products.product"
    );
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo el carrito" });
  }
});

router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    const product = await Product.findById(req.params.pid);
    if (!cart || !product)
      return res
        .status(404)
        .json({ error: "Carrito o producto no encontrado" });

    const existingProduct = cart.products.find((p) =>
      p.product.equals(product._id)
    );
    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.products.push({ product: product._id, quantity: 1 });
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: "Error agregando producto al carrito" });
  }
});

router.get("/:cid/view", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate(
      "products.product"
    );
    if (!cart) return res.status(404).send("Carrito no encontrado");

    res.render("cart", { cart });
  } catch (err) {
    res.status(500).send("Error al cargar el carrito");
  }
});

router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    cart.products = cart.products.filter((p) => !p.product.equals(pid));
    await cart.save();

    res.json({ message: "Producto eliminado del carrito", cart });
  } catch (err) {
    res.status(500).json({ error: "Error eliminando producto del carrito" });
  }
});

router.put("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const products = req.body.products;
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    cart.products = products;
    await cart.save();

    res.json({ message: "Carrito actualizado", cart });
  } catch (err) {
    res.status(500).json({ error: "Error actualizando el carrito" });
  }
});

router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 1) {
      return res.status(400).json({ error: "Cantidad inválida" });
    }

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    const productInCart = cart.products.find((p) => p.product.equals(pid));
    if (!productInCart) {
      return res
        .status(404)
        .json({ error: "Producto no encontrado en el carrito" });
    }

    productInCart.quantity = quantity;
    await cart.save();

    res.json({ message: "Cantidad actualizada", cart });
  } catch (err) {
    res.status(500).json({ error: "Error actualizando cantidad del producto" });
  }
});

router.delete("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    cart.products = [];
    await cart.save();

    res.json({ message: "Carrito vaciado", cart });
  } catch (err) {
    res.status(500).json({ error: "Error vaciando el carrito" });
  }
});

export default router;
