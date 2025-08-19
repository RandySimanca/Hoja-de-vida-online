// backend/app.js

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import formacionAcademicaRoutes from "./routes/formacionAcademica.js"; 
import experienciaRoutes from "./routes/experiencia.js";
//import firmaServidorRoutes from "./routes/firmaServidor.js";



dotenv.config();

const app = express();
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.error("Error en MongoDB:", err));


app.use("/api/formacion-academica", formacionAcademicaRoutes);
app.use("/api/experiencia", experienciaRoutes);
//app.use("/api/firma-servidor", firmaServidorRoutes);


import hojaRoutes from "./routes/hojaVidaRoutes.js"; 
app.use('/api', hojaRoutes); 


//archivos estaticos para montar el front desde el backend

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const PORT = process.env.PORT || 3000;

// Servir el frontend
app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
// Exportar la aplicación para usarla en otros módulos

export default app;