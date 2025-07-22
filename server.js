import express from "express";
import cartsRouter from "./routes/carts.routes.js";
import productsRouter from "./routes/products.routes.js";
import viewsRouter from "./routes/views.routes.js";
import handlebars from "express-handlebars";
import exphbs from "express-handlebars";
import path from "path";
import __dirname from "./utils.js";
import { connectToDB } from "./db.js";

const app = express();
const PORT = 8080;

connectToDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine(
  "handlebars",
  exphbs.engine({
    helpers: {
      multiply: (a, b) => a * b,
      calculateTotal: (products) =>
        products.reduce(
          (acc, item) => acc + item.product.price * item.quantity,
          0
        ),
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", "./views");

app.use("/api/carts", cartsRouter);
app.use("/api/products", productsRouter);
app.use("/", viewsRouter);

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
