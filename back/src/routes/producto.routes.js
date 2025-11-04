import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import pool from "../db/connection.js";
import {
  getProductos,
  addProducto,
  updateProducto,
  deleteProducto,
} from "../controllers/producto.controller.js";

const router = Router();

// Carpeta física donde guardamos imágenes (frente a back/src)
const imgDir = path.join(process.cwd(), "../front/img");

// Crear carpeta si no existe
if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

// Configuración de Multer con nombre único (timestamp)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imgDir);
  },
  filename: (req, file, cb) => {
    const nombreProducto = (req.body.nombre || "producto").replace(/\s+/g, "_");
    const timestamp = Date.now();
    cb(null, `${nombreProducto}_${timestamp}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// Rutas
router.get("/", getProductos);
router.post("/", upload.single("imagen"), addProducto);

// 👉 En EDITAR permitimos imagen opcional (upload.single)
router.put("/:id", upload.single("imagen"), updateProducto);

router.delete("/:id", deleteProducto);

// ENUM tipos (para cargar selects en front)
router.get("/tipos", async (req, res) => {
  const [rows] = await pool.query("SHOW COLUMNS FROM productos LIKE 'tipo'");
  const enumStr = rows[0].Type;
  const values = enumStr.replace(/enum\(|\)/g, "").replace(/'/g, "").split(",");
  res.json(values);
});

export default router;
