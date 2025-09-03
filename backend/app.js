// backend/app.js - CON RUTAS CORREGIDAS
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
import hojaVidaRoute from "./routes/hojaVidaRoutes.js";  // ✅ Ya no comentada
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
try {
  console.log("Registering API routes...");
  
  app.use("/api/usuarios", usuariosRoute);
  app.use("/api/login", loginRoute);
  app.use("/api/datos-personales", datosPersonalesRoute);
  app.use("/api/formacion-academica", formacionAcademicaRoute);
  app.use("/api", hojaVidaRoute);  // ✅ Ahora funcionará: /api/hoja-vida
  app.use("/api/experiencia", experienciaRoutes);
  app.use("/api/experiencia-tot", experienciaTotRoutes);
  app.use("/api/firma-servidor", firmaServidorRoutes);
  app.use('/api/pdf', pdfRoutes);
  
  console.log("API routes registered successfully.");
} catch (error) {
  console.error("❌ Error registering API routes:", error);
  process.exit(1); 
}

// --- MODO API-ONLY ---
console.log("⚠️ Configurando modo API-only.");

app.get("/", (req, res) => {
  res.json({ 
    message: "🚀 API Hoja de Vida funcionando",
    status: "OK",
    mode: "API-only",
    timestamp: new Date().toISOString(),
    endpoints: {
      usuarios: "/api/usuarios",
      login: "/api/login", 
      datosPersonales: "/api/datos-personales",
      formacionAcademica: "/api/formacion-academica",
      hojaCompleta: "/api/hoja-vida",  // ✅ Ruta corregida
      experiencia: "/api/experiencia",
      experienciaTot: "/api/experiencia-tot",
      firmaServidor: "/api/firma-servidor",
      pdf: "/api/pdf"
    }
  });
});

// --- MANEJO DE 404 ---
app.use("*", (req, res) => {
  res.status(404).json({ 
    error: "Endpoint no encontrado",
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      "/api/usuarios",
      "/api/login",
      "/api/datos-personales",
      "/api/formacion-academica",
      "/api/hoja-vida",
      "/api/experiencia",
      "/api/pdf"
    ]
  });
});

// --- INICIAR SERVIDOR ---
const PORT = process.env.PORT || 4000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor funcionando en puerto ${PORT}`);
  console.log(`🌐 Modo: API-only`);
  console.log(`📡 Endpoints disponibles en: https://tu-app.herokuapp.com/`);
}).on('error', (err) => {
  console.error('❌ Error iniciando servidor:', err);
  process.exit(1);
});

export default app;
/** backend/app.js - VERSIÓN LIMPIA (Sin Workaround)
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

// --- API Routes (LIMPIO - UN SOLO PREFIJO /api/) ---
try {
  console.log("Registering API routes...");
  
  app.use("/api/usuarios", usuariosRoute);
  app.use("/api/login", loginRoute);
  app.use("/api/datos-personales", datosPersonalesRoute);
  app.use("/api/formacion-academica", formacionAcademicaRoute);
  app.use("/api", hojaVidaRoute);  // Si hojaVidaRoute tiene rutas como "/hoja-de-vida"
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

export default app; */
