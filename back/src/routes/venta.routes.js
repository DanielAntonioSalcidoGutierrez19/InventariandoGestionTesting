import { Router } from "express";
import {
  registrarVenta,
  getVentas,
  getVentaById,
  reporteDia,
  rankingDia,
  ticketsDia
} from "../controllers/venta.controller.js";

const router = Router();

// Registrar venta nueva
router.post("/", registrarVenta);

// Obtener todas las ventas
router.get("/", getVentas);

// Reportes diarios (IMPORTANTE: declararlas antes de /:id )
router.get("/reporte-dia/:fecha", reporteDia);
router.get("/ranking-dia/:fecha", rankingDia);
router.get("/tickets-dia/:fecha", ticketsDia);

// Obtener venta por id puntual
router.get("/:id", getVentaById);

export default router;
