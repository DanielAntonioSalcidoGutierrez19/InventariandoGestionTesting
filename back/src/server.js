import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./db/connection.js";

// Importar rutas
import productoRoutes from "./routes/producto.routes.js";
import authRoutes from "./routes/auth.routes.js";
import usuarioRoutes from "./routes/usuarios.routes.js";
import ventaRoutes from "./routes/venta.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ==========================
// 🔹 Configurar rutas absolutas
// ==========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================
// 🔹 SERVIR IMAGENES DEL FRONT
// ==========================
app.use("/img", express.static(path.join(process.cwd(), "../front/img")));

// ==========================
// 🔹 Rutas API
// ==========================
app.use("/api/productos", productoRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/venta", ventaRoutes);

// ==========================
// 🔹 Probar conexión MySQL
// ==========================
const testConnection = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Conexión MySQL exitosa");
  } catch (error) {
    console.error("❌ Error de conexión MySQL:", error);
  }
};
testConnection();

// ==========================
// 🔹 Ruta no encontrada
// ==========================
app.use((req, res) => {
  console.log("❌ Ruta no encontrada:", req.originalUrl);
  res.status(404).json({ message: "Ruta no encontrada", success: false });
});

// ==========================
// 🔹 Iniciar servidor
// ==========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
);
