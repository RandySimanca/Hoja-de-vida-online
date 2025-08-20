// backend/app.js - FULL & CORRECTED VERSION
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import usuariosRoute from "./routes/usuarios.js";
import loginRoute from "./routes/login.js";
import datosPersonalesRoute from "./routes/datosPersonales.js";
import formacionAcademicaRoute from "./routes/formacionAcademica.js";
import hojaVidaRoute from "./routes/hojaVidaRoutes.js";
import experienciaRoutes from "./routes/experiencia.js";
import experienciaTotRoutes from "./routes/experienciaTot.js";
import firmaServidorRoutes from "./routes/firmaServidor.js";
import pdfRoutes from './routes/pdf.js';

// --- Server Setup ---
dotenv.config();
const app = express();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- API Routes ---
// We wrap this in a try-catch block to provide better error logging if a route fails to load.
try {
  console.log("Registering API routes...");
  app.use("/api/usuarios", usuariosRoute);
  app.use("/api/login", loginRoute);
  // Note: The router in datosPersonales.js already includes "/datos-personales"
  app.use("/api", datosPersonalesRoute);
  app.use("/api/formacion-academica", formacionAcademicaRoute);
  // Note: The router in hojaVidaRoutes.js already includes "/hoja-de-vida"
  app.use("/api", hojaVidaRoute);
  app.use("/api/experiencia", experienciaRoutes);
  app.use("/api/experiencia-tot", experienciaTotRoutes);
  app.use("/api/firma-servidor", firmaServidorRoutes);
  app.use('/api/pdf', pdfRoutes);
  console.log("API routes registered successfully.");
} catch (error) {
  console.error("❌ Error registering API routes:", error);
  process.exit(1);
}


// --- Frontend Serving ---
const frontendDistPath = path.resolve(__dirname, "../Frontend/dist");
console.log(`Serving frontend static files from: ${frontendDistPath}`);
app.use(express.static(frontendDistPath));

// For any other request, serve the Vue app's index.html
app.get("*", (req, res) => {
  const indexPath = path.resolve(frontendDistPath, "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error(`Error serving index.html from ${indexPath}`, err);
      res.status(500).send("Error serving the application.");
    }
  });
});

// --- Port and Server Start ---
const PORT = process.env.PORT || 4000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('❌ Server startup error:', err);
});

export default app;