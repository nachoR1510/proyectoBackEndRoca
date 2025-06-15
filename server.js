import express from "express";
import fs from "fs";

const server = express();
const PORT = 8080;

server.use(express.json());

const productsFile = "./products.json";
const cartsFile = "./carts.json";

function readProducts() {
  if (!fs.existsSync(productsFile)) {
    console.log("Archivo no encontrado. Retornando array vacío.");
    return [];
  }

  const data = fs.readFileSync(productsFile, "utf-8");
  try {
    const parsed = JSON.parse(data);
    return parsed;
  } catch (error) {
    console.error("Error al parsear JSON:", error);
    return [];
  }
}

function writeProducts(products) {
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
}

function readCarts() {
  if (!fs.existsSync(cartsFile)) return [];
  const data = fs.readFileSync(cartsFile, "utf-8");
  return JSON.parse(data);
}

function writeCarts(carts) {
  fs.writeFileSync(cartsFile, JSON.stringify(carts, null, 2));
}

let products = readProducts();
let carts = readCarts();
let currentId =
  products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
let currentCartId =
  carts.length > 0 ? Math.max(...carts.map((c) => c.id)) + 1 : 1;

server.get("/api/products", (req, res) => {
  res.json(products);
});

server.get("/api/products/:pid", (req, res) => {
  const id = parseInt(req.params.pid);
  const product = products.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  res.json(product);
});

server.post("/api/products", (req, res) => {
  const {
    title,
    description,
    code,
    price,
    status,
    stock,
    category,
    thumbnails,
  } = req.body;

  const newProduct = {
    id: currentId++,
    title,
    description,
    code,
    price,
    status,
    stock,
    category,
    thumbnails,
  };

  products.push(newProduct);
  writeProducts(products);
  res.status(201).json(newProduct);
});

server.put("/api/products/:pid", (req, res) => {
  const id = parseInt(req.params.pid);
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  products[index] = { ...products[index], ...req.body, id };
  writeProducts(products);
  res.json(products[index]);
});

server.delete("/api/products/:pid", (req, res) => {
  const id = parseInt(req.params.pid);
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  products.splice(index, 1);
  writeProducts(products);
  res.json({ message: "Producto eliminado" });
});

server.post("/api/carts", (req, res) => {
  const newCart = {
    id: currentCartId++,
    products: [],
  };
  carts.push(newCart);
  writeCarts(carts);
  res.json({ message: "Carrito creado", cart: newCart });
});

server.get("/api/carts/:cid", (req, res) => {
  const cid = parseInt(req.params.cid);
  const cart = carts.find((c) => c.id === cid);
  if (!cart) {
    return res.status(404).json({ error: "Carrito no encontrado" });
  }
  res.json(cart.products);
});

server.post("/api/carts/:cid/product/:pid", (req, res) => {
  const cid = parseInt(req.params.cid);
  const pid = parseInt(req.params.pid);

  const cart = carts.find((c) => c.id === cid);
  if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

  const product = products.find((p) => p.id === pid);
  if (!product)
    return res.status(404).json({ error: "Producto no encontrado" });

  const productInCart = cart.products.find((p) => p.product === pid);
  if (productInCart) {
    productInCart.quantity++;
  } else {
    cart.products.push({ product: pid, quantity: 1 });
  }

  writeCarts(carts);

  res.json({ message: "Producto agregado al carrito", cart });
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
