// backend/routes/datosPersonales.js
import express from "express";
import { 
  crearDatosPersonales, 
  obtenerDatosPersonales, 
  actualizarDatosPersonales 
} from "../controllers/datosPersonalesControllers.js";
import verificarJWT from "../middlewares/verificarJWT.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.send("🚀 Ruta de datos-personales activa");
});

// Rutas corregidas (sin prefijo duplicado)
router.post("/", verificarJWT, crearDatosPersonales);
router.get("/", verificarJWT, obtenerDatosPersonales);
router.put("/", verificarJWT, actualizarDatosPersonales);

export default router;
