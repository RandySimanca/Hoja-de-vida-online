// backend/app.js - VERSIÓN MÍNIMA PARA DIAGNÓSTICO
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

console.log('🚀 Iniciando aplicación...');
console.log('📁 __dirname:', __dirname);
console.log('🌍 NODE_ENV:', process.env.NODE_ENV);
console.log('🔧 PORT:', process.env.PORT);

// Middlewares básicos
app.use(express.json());
app.use(express.static(path.join(__dirname, "../Frontend/dist")));

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend funcionando', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV 
  });
});

// Ruta para servir el frontend
app.get("*", (req, res) => {
  const indexPath = path.resolve(__dirname, "../Frontend/dist", "index.html");
  console.log('📄 Intentando servir:', indexPath);
  
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('❌ Error sirviendo index.html:', err);
      res.status(404).send(`
        <h1>App en desarrollo</h1>
        <p>Frontend path: ${indexPath}</p>
        <p>Error: ${err.message}</p>
        <p><a href="/api/test">Test Backend</a></p>
      `);
    }
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
}).on('error', (err) => {
  console.error('❌ Error iniciando servidor:', err);
});

export default app;