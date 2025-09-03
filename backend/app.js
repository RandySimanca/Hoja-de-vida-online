// backend/app.js - VERSIÓN DEFINITIVA CORREGIDA
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
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
try {
  console.log("Registering API routes...");
  
  app.use("/api/usuarios", usuariosRoute);
  app.use("/api/login", loginRoute);
  app.use("/api/datos-personales", datosPersonalesRoute);
  app.use("/api/formacion-academica", formacionAcademicaRoute);
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

// --- BÚSQUEDA SEGURA DEL FRONTEND ---
const possibleFrontendPaths = [
  path.resolve(__dirname, "../Frontend/dist"),
  path.resolve(__dirname, "../frontend/dist"),
  path.resolve(__dirname, "./dist"),
  path.resolve(__dirname, "../dist")
];

let frontendDistPath = null;
let frontendFound = false;

for (const testPath of possibleFrontendPaths) {
  try {
    if (fs.existsSync(testPath) && fs.existsSync(path.join(testPath, 'index.html'))) {
      frontendDistPath = testPath;
      frontendFound = true;
      console.log(`✅ Frontend encontrado en: ${frontendDistPath}`);
      break;
    }
  } catch (err) {
    console.log(`⚠️  Error verificando ${testPath}: ${err.message}`);
  }
}

if (!frontendFound) {
  console.log("⚠️  Frontend no encontrado. Configurando modo API-only.");
}

// --- CONFIGURACIÓN CONDICIONAL DEL FRONTEND ---
if (frontendFound && frontendDistPath) {
  try {
    console.log(`Configurando archivos estáticos desde: ${frontendDistPath}`);
    app.use(express.static(frontendDistPath));
    
    // Solo agregar catch-all si todo está bien
    app.get("*", (req, res) => {
      try {
        const indexPath = path.resolve(frontendDistPath, "index.html");
        res.sendFile(indexPath);
      } catch (err) {
        console.error(`Error sirviendo index.html:`, err);
        res.status(500).json({ 
          error: "Error serving frontend",
          message: "Frontend files not accessible"
        });
      }
    });
  } catch (error) {
    console.error("❌ Error configurando frontend:", error);
    frontendFound = false;
  }
}

// --- RUTA POR DEFECTO PARA API-ONLY ---
if (!frontendFound) {
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
        experiencia: "/api/experiencia",
        hojaCompleta: "/api/hoja-de-vida",
        pdf: "/api/pdf"
      }
    });
  });

  // Ruta catch-all para APIs no encontradas
  app.get("*", (req, res) => {
    res.status(404).json({ 
      error: "Endpoint no encontrado",
      message: `La ruta ${req.path} no existe`,
      availableEndpoints: [
        "/api/usuarios",
        "/api/login",
        "/api/datos-personales",
        "/api/formacion-academica",
        "/api/experiencia"
      ]
    });
  });
}

// --- MANEJO DE ERRORES ---
app.use((error, req, res, next) => {
  console.error("❌ Server Error:", error);
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// --- INICIAR SERVIDOR ---
const PORT = process.env.PORT || 4000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor funcionando en puerto ${PORT}`);
  console.log(`🌐 Modo: ${frontendFound ? 'Fullstack' : 'API-only'}`);
  console.log(`📡 Health check: http://localhost:${PORT}/`);
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
