// server.js
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import app from './app.js';
import mongoose from 'mongoose';

dotenv.config();

connectDB(); // ← esta línea sí conecta usando tu configuración personalizada
mongoose.connect("mongodb+srv://randysimancamercado2:Valeria1324@clustermiapp.z0bbfnk.mongodb.net/baseDeDatosHV", {useNewUrlParser: true})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});

