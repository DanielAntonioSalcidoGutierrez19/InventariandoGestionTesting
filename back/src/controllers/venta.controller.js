// src/controllers/venta.controller.js
import pool from "../db/connection.js";

// ==========================================
// ✅ Registrar una venta y sus detalles (con transacción)
// ==========================================
export const registrarVenta = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id_usuario, metodo_pago, productos } = req.body;

    // Validaciones básicas
    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ message: "No hay productos en la venta" });
    }
    const mp = String(metodo_pago || "").toLowerCase();
    if (!["efectivo", "transferencia"].includes(mp)) {
      return res.status(400).json({ message: "Método de pago inválido" });
    }

    // Calcular total
    const total = productos.reduce(
      (acc, p) => acc + Number(p.precio_unitario) * Number(p.cantidad),
      0
    );

    await conn.beginTransaction();

    // Verificar usuario (si viene): si NO existe -> usar NULL para no romper la FK
    let userIdForInsert = null;
    if (id_usuario !== undefined && id_usuario !== null && id_usuario !== "") {
      const numId = Number(id_usuario);
      if (Number.isFinite(numId)) {
        const [u] = await conn.query(
          "SELECT id_usuario FROM usuarios WHERE id_usuario = ? LIMIT 1",
          [numId]
        );
        if (u.length > 0) userIdForInsert = numId; // existe
        // si no existe, se queda null (FK lo acepta)
      }
    }

    // Insert venta
    const [ventaResult] = await conn.query(
      `INSERT INTO ventas (id_usuario, fecha_venta, metodo_pago, total)
       VALUES (?, NOW(), ?, ?)`,
      [userIdForInsert, mp, total]
    );
    const id_venta = ventaResult.insertId;

    // Insert detalle por cada producto (con producto_nombre) y actualizar stock
    for (const p of productos) {
      const idProd = Number(p.id_producto);
      const cantidad = Number(p.cantidad);
      const precioUnit = Number(p.precio_unitario);
      if (!Number.isFinite(idProd) || !Number.isFinite(cantidad) || cantidad <= 0 || !Number.isFinite(precioUnit)) {
        await conn.rollback();
        return res.status(400).json({ message: "Producto inválido en el detalle" });
      }

      const [[rowProd] = []] = await conn.query(
        `SELECT nombre, stock FROM productos WHERE id_producto = ? LIMIT 1`,
        [idProd]
      );
      const nombreProducto = rowProd?.nombre || null;
      const stockActual = Number(rowProd?.stock ?? 0);

      await conn.query(
        `INSERT INTO detalle_venta
           (id_venta, id_producto, cantidad, precio_unitario, subtotal, producto_nombre)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id_venta, idProd, cantidad, precioUnit, cantidad * precioUnit, nombreProducto]
      );

      const nuevoStock = Math.max(0, stockActual - cantidad);
      await conn.query(
        `UPDATE productos SET stock = ? WHERE id_producto = ?`,
        [nuevoStock, idProd]
      );
    }

    await conn.commit();
    return res.status(201).json({ message: "✅ Venta registrada correctamente", id_venta });

  } catch (error) {
    console.error("❌ Error al registrar venta:", error);
    try { await conn.rollback(); } catch {}
    return res.status(500).json({ message: "Error al registrar venta", error: error.message });
  } finally {
    conn.release();
  }
};

// ==========================================
// ✅ Obtener todas las ventas (lista)
// ==========================================
export const getVentas = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT v.id_venta, v.id_usuario, v.metodo_pago, v.total, v.fecha_venta
       FROM ventas v
       ORDER BY v.id_venta DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error("❌ Error al obtener ventas:", error);
    res.status(500).json({ message: "Error al obtener ventas" });
  }
};

// ==========================================
// ✅ Obtener una venta puntual (con detalles)
// ==========================================
export const getVentaById = async (req, res) => {
  try {
    const { id } = req.params;
    const [venta] = await pool.query(`SELECT * FROM ventas WHERE id_venta = ?`, [id]);
    if (venta.length === 0) return res.status(404).json({ message: "Venta no encontrada" });

    const [detalles] = await pool.query(
      `SELECT d.id_detalle, d.id_producto, d.cantidad, d.precio_unitario, d.subtotal, d.producto_nombre
       FROM detalle_venta d
       WHERE d.id_venta = ?`,
      [id]
    );

    res.json({ ...venta[0], detalles });
  } catch (error) {
    console.error("❌ Error al obtener venta por ID:", error);
    res.status(500).json({ message: "Error al obtener venta por ID" });
  }
};

// ==========================================
// 📊 REPORTE DIARIO
// ==========================================
export const reporteDia = async (req, res) => {
  try {
    const { fecha } = req.params; // YYYY-MM-DD
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS tickets, COALESCE(SUM(total),0) AS total
       FROM ventas
       WHERE fecha_venta BETWEEN ? AND ?`,
      [`${fecha} 00:00:00`, `${fecha} 23:59:59`]
    );
    res.json(rows[0]);
  } catch (error) {
    console.error("❌ Error reporteDia:", error);
    res.status(500).json({ message: "Error en reporte diario" });
  }
};

// ==========================================
// 🥇 RANKING DE ARTÍCULOS POR DÍA (usa producto_nombre)
// ==========================================
export const rankingDia = async (req, res) => {
  try {
    const { fecha } = req.params; // YYYY-MM-DD
    const [rows] = await pool.query(
      `SELECT
          COALESCE(d.producto_nombre, CONCAT('ID ', d.id_producto)) AS nombre,
          SUM(d.cantidad) AS total_vendido,
          SUM(d.subtotal) AS total_monto
       FROM detalle_venta d
       INNER JOIN ventas v ON d.id_venta = v.id_venta
       WHERE v.fecha_venta BETWEEN ? AND ?
       GROUP BY COALESCE(d.producto_nombre, d.id_producto)
       ORDER BY total_vendido DESC, total_monto DESC`,
      [`${fecha} 00:00:00`, `${fecha} 23:59:59`]
    );
    res.json(rows);
  } catch (error) {
    console.error("❌ Error rankingDia:", error);
    res.status(500).json({ message: "Error en ranking diario" });
  }
};

// ==========================================
// 🧾 LISTA DE TICKETS DEL DÍA (FOLIO B)
// ==========================================
export const ticketsDia = async (req, res) => {
  try {
    const { fecha } = req.params; // YYYY-MM-DD
    const [rows] = await pool.query(
      `SELECT
          v.id_venta,
          v.total,
          v.fecha_venta,
          CONCAT(
            DATE_FORMAT(v.fecha_venta, '%Y%m%d'), '-',
            ROW_NUMBER() OVER (PARTITION BY DATE(v.fecha_venta)
                               ORDER BY v.fecha_venta ASC, v.id_venta ASC)
          ) AS folio
       FROM ventas v
       WHERE v.fecha_venta BETWEEN ? AND ?
       ORDER BY v.fecha_venta ASC, v.id_venta ASC`,
      [`${fecha} 00:00:00`, `${fecha} 23:59:59`]
    );
    res.json(rows);
  } catch (error) {
    console.error("❌ Error ticketsDia:", error);
    res.status(500).json({ message: "Error al obtener tickets del día" });
  }
};
