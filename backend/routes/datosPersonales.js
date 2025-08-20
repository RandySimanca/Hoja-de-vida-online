//backend/routes/datosPersonales.js

import express from "express";
import { crearDatosPersonales } from "../controllers/datosPersonalesControllers.js";
import { obtenerDatosPersonales } from "../controllers/datosPersonalesControllers.js";
import { actualizarDatosPersonales } from "../controllers/datosPersonalesControllers.js";
import auth from "../middlewares/auth.js";
import verificarJWT from "../middlewares/verificarJWT.js";



const router = express.Router();

// Ruta de test (¡útil para verificar que se monte bien!)
router.get("/test", (req, res) => {
  res.send("🚀 Ruta de datos-personales activa");
});

// POST principal
router.post("/", verificarJWT, crearDatosPersonales);
router.get("/", verificarJWT, obtenerDatosPersonales);
router.put("/", verificarJWT, actualizarDatosPersonales);


export default router;

