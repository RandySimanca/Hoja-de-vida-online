// backend/app.js - VERSIÓN OPTIMIZADA PARA HEROKU
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

// --- CONFIGURACIÓN INICIAL ---
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Conectar a MongoDB
connectDB();

// --- MIDDLEWARES ---
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://tu-app-heroku.herokuapp.com', 'https://hoja-vida-randy.herokuapp.com'] // Cambia por tu dominio real
    : ['http://localhost:3000', 'http://localhost:5173'], // Para desarrollo
  credentials: true
}));

app.use(express.json({ limit: '50mb' })); // Para imágenes base64
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// --- RUTAS DE LA API ---
try {
  console.log("📡 Registrando rutas de la API...");
  
  app.use("/api/usuarios", usuariosRoute);
  app.use("/api/login", loginRoute);
  app.use("/api/datos-personales", datosPersonalesRoute);
  app.use("/api/formacion-academica", formacionAcademicaRoute);
  app.use("/api", hojaVidaRoute); // Contiene /hoja-de-vida
  app.use("/api/experiencia", experienciaRoutes);
  app.use("/api/experiencia-tot", experienciaTotRoutes);
  app.use("/api/firma-servidor", firmaServidorRoutes);
  app.use('/api/pdf', pdfRoutes);
  
  console.log("✅ Rutas de la API registradas exitosamente");
} catch (error) {
  console.error("❌ Error registrando rutas de la API:", error);
  process.exit(1); 
}

// --- RUTA RAÍZ (Información de la API) ---
app.get("/", (req, res) => {
  res.json({ 
    message: "🚀 API Hoja de Vida Online - Randy Simanca",
    status: "OK",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      usuarios: "/api/usuarios (POST)",
      login: "/api/login (POST)", 
      datosPersonales: "/api/datos-personales (GET, POST, PUT)",
      formacionAcademica: "/api/formacion-academica (GET, POST, PUT, DELETE)",
      hojaCompleta: "/api/hoja-de-vida (GET)",
      experiencia: "/api/experiencia (GET, POST, PUT, DELETE)",
      experienciaTot: "/api/experiencia-tot (GET, POST)",
      firmaServidor: "/api/firma-servidor (GET, POST)",
      pdf: "/api/pdf/generar-pdf (POST)"
    },
    database: "MongoDB Atlas",
    author: "Randy Simanca"
  });
});

// --- RUTA DE SALUD PARA HEROKU ---
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV
  });
});

// --- MANEJO DE RUTAS NO ENCONTRADAS ---
app.use("*", (req, res) => {
  console.log(`❌ Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: "Endpoint no encontrado",
    path: req.originalUrl,
    method: req.method,
    message: "La ruta que buscas no existe en esta API",
    availableEndpoints: [
      "GET  / (info de la API)",
      "GET  /health (estado del servidor)",
      "POST /api/usuarios (registro)",
      "POST /api/login (autenticación)",
      "GET  /api/datos-personales",
      "GET  /api/formacion-academica",
      "GET  /api/hoja-de-vida",
      "GET  /api/experiencia"
    ],
    documentation: "Consulta la documentación en el endpoint raíz '/'"
  });
});

// --- MANEJO DE ERRORES ---
app.use((error, req, res, next) => {
  console.error('❌ Error no manejado:', error);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo salió mal',
    timestamp: new Date().toISOString()
  });
});

// --- INICIAR SERVIDOR ---
const PORT = process.env.PORT || 4000;

app.listen(PORT, function () 
  {
  console.log('\n🎉 ================================');
  console.log('✅ SERVIDOR INICIADO EXITOSAMENTE');
  console.log(`🌐 Puerto: ${PORT}`);  
})
     


export default app;
