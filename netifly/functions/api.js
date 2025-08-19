import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import connectDB from '../../backend/config/db.js';

// Importa tus rutas del backend
import usuarioRoutes from '../../backend/routes/usuarios.js';

const app = express();

// Conectar BD
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/usuarios', usuarioRoutes);

export const handler = serverless(app);