import pool from "../db/connection.js";

// ==========================================
// ✅ Registrar una venta y sus detalles
// ==========================================
export const registrarVenta = async (req, res) => {
  try {
    const { id_usuario, metodo_pago, productos } = req.body;

    if (!productos || productos.length === 0) {
      return res.status(400).json({ message: "No hay productos en la venta" });
    }

    if (!metodo_pago) {
      return res.status(400).json({ message: "Falta el método de pago" });
    }

    // total venta
    const total = productos.reduce(
      (acc, p) => acc + p.precio_unitario * p.cantidad,
      0
    );

    // Insert venta
    const [ventaResult] = await pool.query(
      `INSERT INTO ventas (id_usuario, fecha_venta, metodo_pago, total)
       VALUES (?, NOW(), ?, ?)`,
      [id_usuario || 1, metodo_pago.toLowerCase(), total]
    );

    const id_venta = ventaResult.insertId;

    // Insert detalle por cada producto
    for (const p of productos) {
      await pool.query(
        `INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [
          id_venta,
          p.id_producto,
          p.cantidad,
          p.precio_unitario,
          p.cantidad * p.precio_unitario,
        ]
      );

      // descontar stock
      await pool.query(
        `UPDATE productos SET stock = stock - ? WHERE id_producto = ?`,
        [p.cantidad, p.id_producto]
      );
    }

    return res
      .status(201)
      .json({ message: "✅ Venta registrada correctamente", id_venta });
  } catch (error) {
    console.error("❌ Error al registrar venta:", error);
    return res
      .status(500)
      .json({ message: "Error al registrar venta", error: error.message });
  }
};

// ==========================================
// ✅ Obtener todas las ventas
// ==========================================
export const getVentas = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT v.id_venta, v.id_usuario, v.metodo_pago, v.total, v.fecha_venta
       FROM ventas v ORDER BY v.id_venta DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error("❌ Error al obtener ventas:", error);
    res.status(500).json({ message: "Error al obtener ventas" });
  }
};

// ==========================================
// ✅ Obtener una venta puntual
// ==========================================
export const getVentaById = async (req, res) => {
  try {
    const { id } = req.params;

    const [venta] = await pool.query(
      `SELECT * FROM ventas WHERE id_venta = ?`,
      [id]
    );
    if (venta.length === 0)
      return res.status(404).json({ message: "Venta no encontrada" });

    const [detalles] = await pool.query(
      `SELECT d.*, p.nombre AS producto
       FROM detalle_venta d
       JOIN productos p ON d.id_producto = p.id_producto
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
    const { fecha } = req.params;
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
// 🥇 RANKING DE ARTICULOS POR DIA
// ==========================================
export const rankingDia = async (req, res) => {
  try {
    const { fecha } = req.params;

    const [rows] = await pool.query(
      `SELECT p.nombre,
              SUM(d.cantidad) AS total_vendido,
              SUM(d.subtotal) AS total_monto
       FROM detalle_venta d
       INNER JOIN ventas v ON d.id_venta = v.id_venta
       INNER JOIN productos p ON d.id_producto = p.id_producto
       WHERE v.fecha_venta BETWEEN ? AND ?
       GROUP BY p.nombre
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
// 🧾 LISTA DE TICKETS DEL DIA (FOLIO B)
// ==========================================
export const ticketsDia = async (req, res) => {
  try {
    const { fecha } = req.params;

    const [rows] = await pool.query(
      `SELECT
          v.id_venta,
          v.total,
          v.fecha_venta,
          CONCAT(DATE_FORMAT(v.fecha_venta, '%Y%m%d'), '-', 
                 ROW_NUMBER() OVER (PARTITION BY DATE(v.fecha_venta)
                                    ORDER BY v.fecha_venta ASC, v.id_venta ASC)) AS folio
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
