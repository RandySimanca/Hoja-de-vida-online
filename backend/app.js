// backend/app.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors"; // ✅ Añadir CORS

// --- Importar rutas API ---
// [tus imports existentes]

dotenv.config();
const app = express();

// ✅ Habilitar CORS para Heroku
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://tu-app.herokuapp.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// --- Middleware global ---
app.use(express.json());

// ✅ Conexión MongoDB mejorada
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB conectado");
  } catch (err) {
    console.error("❌ Error en MongoDB:", err);
    process.exit(1); // ✅ Forzar salida en producción
  }
};

connectDB();

// --- Rutas API ---
// [tus routes existentes]

// --- Configuración de frontend ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Servir archivos estáticos solo en producción
if (process.env.NODE_ENV === 'production') {
  const frontendDistPath = path.resolve(__dirname, "../frontend/dist");
  app.use(express.static(frontendDistPath));
  
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

// --- Configurar puerto ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
  console.log(`🌐 Modo: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
