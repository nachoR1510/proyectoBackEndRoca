import { Router } from "express";
import Product from "../models/Product.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;

    const filter = query ? { category: query } : {};
    const sortOption = sort ? { price: sort === "asc" ? 1 : -1 } : {};

    const options = {
      limit: parseInt(limit),
      page: parseInt(page),
      sort: sortOption,
      lean: true,
    };

    const result = await Product.paginate(filter, options);

    res.json({
      status: "success",
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage
        ? `/api/products?page=${result.prevPage}&limit=${limit}`
        : null,
      nextLink: result.hasNextPage
        ? `/api/products?page=${result.nextPage}&limit=${limit}`
        : null,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener productos", detail: error.message });
  }
});

router.get("/:pid", async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid).lean();
    if (!product)
      return res.status(404).json({ error: "Producto no encontrado" });
    res.json(product);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al buscar producto", detail: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al crear producto", detail: error.message });
  }
});

router.put("/:pid", async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.pid, req.body, {
      new: true,
    });
    if (!updated)
      return res.status(404).json({ error: "Producto no encontrado" });
    res.json(updated);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al actualizar producto", detail: error.message });
  }
});

router.delete("/:pid", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.pid);
    if (!deleted)
      return res.status(404).json({ error: "Producto no encontrado" });
    res.json({ message: "Producto eliminado" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al eliminar producto", detail: error.message });
  }
});

export default router;
