import { Router } from "express";
import { login } from "../controllers/auth.controller.js";

const router = Router();

// 🔹 Ruta de prueba (para testConnection del index.html)
router.get("/", (req, res) => {
  res.json({ success: true, message: "Ruta /api/auth funcionando correctamente 🚀" });
});

// 🔹 Ruta de inicio de sesión
router.post("/login", login);

export default router;
