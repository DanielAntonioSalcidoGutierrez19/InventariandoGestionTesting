import fs from "fs";
import path from "path";
import pool from "../db/connection.js";

// Helper para convertir ruta relativa /img/... a ruta absoluta en disco
const toAbsoluteImgPath = (relative) => {
  // relative viene como "/img/archivo.png"
  // carpeta real: ../front/img/archivo.png
  const fileName = relative.replace(/^\/?img\//, ""); // "archivo.png"
  return path.join(process.cwd(), "../front/img", fileName);
};

// ==========================================
// 🔹 OBTENER PRODUCTOS (con búsqueda opcional)
// ==========================================
export const getProductos = async (req, res) => {
  const { search } = req.query;

  try {
    let sql = "SELECT * FROM productos";
    const params = [];

    if (search && search.trim() !== "") {
      sql += " WHERE nombre LIKE ? OR tipo LIKE ? OR descripcion LIKE ?";
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error("❌ Error al obtener productos:", error.message);
    res.status(500).json({ message: "Error al obtener productos" });
  }
};

// ==========================================
// 🔹 AGREGAR PRODUCTO (con imagen opcional)
// ==========================================
export const addProducto = async (req, res) => {
  try {
    const { nombre, tipo, descripcion, stock, stock_minimo, precio } = req.body;

    if (!nombre || !tipo || !descripcion) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const stockNum = parseInt(stock) || 0;
    const stockMinNum = parseInt(stock_minimo) || 0;
    const precioNum = parseFloat(precio) || 0.0;

    // Ruta relativa para servir desde Express (/img/archivo.ext)
    const imagen = req.file ? `/img/${req.file.filename}` : null;

    await pool.query(
      `INSERT INTO productos (nombre, tipo, descripcion, stock, stock_minimo, precio, imagen)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre, tipo, descripcion, stockNum, stockMinNum, precioNum, imagen]
    );

    res.status(201).json({ message: "Producto agregado correctamente" });
  } catch (error) {
    console.error("❌ Error al agregar producto:", error.message);
    res.status(500).json({ message: "Error al agregar producto" });
  }
};

// ==========================================
// 🔹 ACTUALIZAR PRODUCTO (imagen opcional; si hay nueva → borra vieja)
// ==========================================
export const updateProducto = async (req, res) => {
  try {
    const { id } = req.params;

    // Producto actual
    const [productoRows] = await pool.query(
      "SELECT * FROM productos WHERE id_producto = ?",
      [id]
    );
    if (productoRows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    const actual = productoRows[0];

    // Construir datos nuevos (manteniendo los actuales si no vienen)
    const nuevo = {
      nombre: req.body.nombre ?? actual.nombre,
      tipo: req.body.tipo ?? actual.tipo,
      descripcion: req.body.descripcion ?? actual.descripcion,
      stock:
        req.body.stock !== undefined ? parseInt(req.body.stock) : actual.stock,
      stock_minimo:
        req.body.stock_minimo !== undefined
          ? parseInt(req.body.stock_minimo)
          : actual.stock_minimo,
      precio:
        req.body.precio !== undefined ? parseFloat(req.body.precio) : actual.precio,
      imagen: actual.imagen, // por defecto se mantiene
    };

    // Si viene nueva imagen → borrar la anterior y setear nueva ruta
    if (req.file) {
      // Borrar imagen anterior si existía
      if (actual.imagen) {
        const absOld = toAbsoluteImgPath(actual.imagen);
        try {
          if (fs.existsSync(absOld)) fs.unlinkSync(absOld);
        } catch (e) {
          console.warn("⚠️ No se pudo eliminar imagen vieja:", absOld, e.message);
        }
      }
      nuevo.imagen = `/img/${req.file.filename}`;
    }

    await pool.query(
      `UPDATE productos
       SET nombre=?, tipo=?, descripcion=?, stock=?, stock_minimo=?, precio=?, imagen=?
       WHERE id_producto=?`,
      [
        nuevo.nombre,
        nuevo.tipo,
        nuevo.descripcion,
        nuevo.stock,
        nuevo.stock_minimo,
        nuevo.precio,
        nuevo.imagen,
        id,
      ]
    );

    res.json({ message: "Producto actualizado correctamente" });
  } catch (error) {
    console.error("❌ Error al actualizar producto:", error.message);
    res.status(500).json({ message: "Error al actualizar producto" });
  }
};

// ==========================================
// 🔹 ELIMINAR PRODUCTO (borra imagen física)
// ==========================================
export const deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;

    const [producto] = await pool.query(
      "SELECT * FROM productos WHERE id_producto = ?",
      [id]
    );
    if (producto.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Borrar imagen física si existe
    if (producto[0].imagen) {
      const absPath = toAbsoluteImgPath(producto[0].imagen);
      try {
        if (fs.existsSync(absPath)) fs.unlinkSync(absPath);
      } catch (e) {
        console.warn("⚠️ No se pudo eliminar imagen:", absPath, e.message);
      }
    }

    await pool.query("DELETE FROM productos WHERE id_producto = ?", [id]);
    res.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar producto:", error.message);
    res.status(500).json({ message: "Error al eliminar producto" });
  }
};
