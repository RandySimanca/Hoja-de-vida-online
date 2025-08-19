// backend/app.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import formacionAcademicaRoutes from "./routes/formacionAcademica.js"; 
import experienciaRoutes from "./routes/experiencia.js";
import hojaRoutes from "./routes/hojaVidaRoutes.js"; 
import usuariosRoute from "./routes/usuarios.js";
import loginRoute from "./routes/login.js";
import datosPersonalesRoute from "./routes/datosPersonales.js";
import experienciaTotRoutes from "./routes/experienciaTot.js";
import firmaServidorRoutes from "./routes/firmaServidor.js";
import pdfRoutes from './routes/pdf.js';
import connectDB from "./config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Conectar a MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Routes
app.use("/api/usuarios", usuariosRoute);
app.use("/api/login", loginRoute);
app.use("/api", datosPersonalesRoute);
app.use("/api/formacion-academica", formacionAcademicaRoutes);
app.use("/api", hojaRoutes);
app.use("/api/experiencia", experienciaRoutes);
app.use("/api/experiencia-Tot", experienciaTotRoutes);
app.use("/api/firma-servidor", firmaServidorRoutes);
app.use('/api/pdf', pdfRoutes);

// Servir archivos estáticos del frontend (SOLO EN PRODUCCIÓN)
if (process.env.NODE_ENV === 'production') {
  // Servir archivos estáticos de la carpeta dist (no build)
  app.use(express.static(path.join(__dirname, "../Frontend/dist")));
  
  // Catch all handler: enviar index.html para rutas no API
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../Frontend/dist", "index.html"));
  });
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});

export default app;