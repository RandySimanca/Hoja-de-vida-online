// backend/app.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

// Importar rutas API
import formacionAcademicaRoutes from "./routes/formacionAcademica.js";
import experienciaRoutes from "./routes/experiencia.js";
import hojaRoutes from "./routes/hojaVidaRoutes.js";
import usuariosRoute from "./routes/usuarios.js";
import loginRoute from "./routes/login.js";
import datosPersonalesRoute from "./routes/datosPersonales.js";
import experienciaTotRoutes from "./routes/experienciaTot.js";
import pdfRoutes from "./routes/pdf.js";
import idiomasRoutes from "./routes/idiomas.js";

dotenv.config();
const app = express();

// Habilitar CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://tu-app.herokuapp.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Conexión MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB conectado");
  } catch (err) {
    console.error("❌ Error en MongoDB:", err);
    process.exit(1);
  }
};
connectDB();

// Rutas API
app.use("/api/formacion-academica", formacionAcademicaRoutes);
app.use("/api/experiencia", experienciaRoutes);
app.use("/api/experiencia-tot", experienciaTotRoutes);
app.use("/api/usuarios", usuariosRoute);
app.use("/api/login", loginRoute);
app.use("/api/datos-personales", datosPersonalesRoute);
app.use("/api/pdf", pdfRoutes);
app.use("/api", hojaRoutes);
app.use("/api/idiomas", idiomasRoutes);

// Servir frontend en producción
if (process.env.NODE_ENV === 'production') {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const frontendDistPath = path.resolve(__dirname, "../frontend/dist");
  
  app.use(express.static(frontendDistPath));
  
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});

export default app;
