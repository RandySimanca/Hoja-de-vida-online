// backend/config/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    console.log('🔄 Intentando conectar a MongoDB...');
    console.log('📡 URI:', process.env.MONGO_URI ? 'URI configurada ✅' : 'URI faltante ❌');

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    console.log(`📊 Base de datos: ${conn.connection.name}`);
    console.log(`🔗 Estado de conexión: ${conn.connection.readyState === 1 ? 'Conectado' : 'Desconectado'}`);
    
    // Manejar eventos de conexión
    mongoose.connection.on('error', (err) => {
      console.error('❌ Error de conexión MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB desconectado');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 Conexión MongoDB cerrada debido a terminación de la aplicación');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    console.error('📝 Stack:', error.stack);
    
    // En desarrollo, salir del proceso
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    
    // En producción, intentar reconexión después de 5 segundos
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;
