// server.js
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import app from './app.js';
import mongoose from 'mongoose';

dotenv.config();

connectDB(); // ← esta línea sí conecta usando tu configuración personalizada
mongoose.connect("mongodb+srv://randysimancamercado2:Valeria1324@clustermiapp.z0bbfnk.mongodb.net/baseDeDatosHV", {useNewUrlParser: true})


// usar estáticos cuando esta en modo produccion //
if(process.env.NODE_ENV === 'production') {
  app.use(express.static('frontend/build'));
  app.get("*", (req, res) => {
      res.sendFile((__dirname + "/frontend/build/index.html"));
  })
  }
  
  
  // cambio de puerto en heroku
  let port = process.env.PORT;
  if (port == null || port == "") {
  port = 5000;
  }
  ////////// 2 fragmentos necesarios para implementar heroku


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});

