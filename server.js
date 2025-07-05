import express from "express";
import fs from "fs";
import { createServer } from "http";
import { Server } from "socket.io";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

const productsFile = "./products.json";
const cartsFile = "./carts.json";

function readProducts() {
  if (!fs.existsSync(productsFile)) return [];
  const data = fs.readFileSync(productsFile, "utf-8");
  try {
    return JSON.parse(data);
  } catch {
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

app.get("/api/products", (req, res) => {
  res.json(products);
});

app.get("/api/products/:pid", (req, res) => {
  const id = parseInt(req.params.pid);
  const product = products.find((p) => p.id === id);
  if (!product)
    return res.status(404).json({ error: "Producto no encontrado" });
  res.json(product);
});

app.post("/api/products", (req, res) => {
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
  io.emit("update-products", products);

  res.status(201).json(newProduct);
});

app.put("/api/products/:pid", (req, res) => {
  const id = parseInt(req.params.pid);
  const index = products.findIndex((p) => p.id === id);
  if (index === -1)
    return res.status(404).json({ error: "Producto no encontrado" });

  products[index] = { ...products[index], ...req.body, id };
  writeProducts(products);
  res.json(products[index]);
});

app.delete("/api/products/:pid", (req, res) => {
  const id = parseInt(req.params.pid);
  const index = products.findIndex((p) => p.id === id);
  if (index === -1)
    return res.status(404).json({ error: "Producto no encontrado" });

  products.splice(index, 1);
  writeProducts(products);
  io.emit("update-products", products);

  res.json({ message: "Producto eliminado" });
});

app.post("/api/carts", (req, res) => {
  const newCart = { id: currentCartId++, products: [] };
  carts.push(newCart);
  writeCarts(carts);
  res.json({ message: "Carrito creado", cart: newCart });
});

app.get("/api/carts/:cid", (req, res) => {
  const cid = parseInt(req.params.cid);
  const cart = carts.find((c) => c.id === cid);
  if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
  res.json(cart.products);
});

app.post("/api/carts/:cid/product/:pid", (req, res) => {
  const cid = parseInt(req.params.cid);
  const pid = parseInt(req.params.pid);
  const cart = carts.find((c) => c.id === cid);
  const product = products.find((p) => p.id === pid);
  if (!cart || !product)
    return res.status(404).json({ error: "Carrito o producto no encontrado" });

  const item = cart.products.find((p) => p.product === pid);
  if (item) item.quantity++;
  else cart.products.push({ product: pid, quantity: 1 });

  writeCarts(carts);
  res.json({ message: "Producto agregado al carrito", cart });
});

app.get("/", (req, res) => {
  const products = readProducts(); // leemos fresh desde el JSON cada vez que entran
  res.render("home", { products });
});

app.get("/realtimeproducts", (req, res) => {
  const products = readProducts(); // Leer fresh del JSON
  res.render("realTimeProducts", { products });
});

io.on("connection", (socket) => {
  console.log("Cliente conectado");
  socket.emit("update-products", products);

  socket.on("new-product", (data) => {
    const newProduct = { id: currentId++, ...data };
    products.push(newProduct);
    writeProducts(products);
    io.emit("update-products", products);
  });

  socket.on("delete-product", (id) => {
    products = products.filter((p) => p.id !== parseInt(id));
    writeProducts(products);
    io.emit("update-products", products);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});
