// --- Server Setup ---
dotenv.config();
const app = express();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- API Routes (Workaround for /api/api/ prefix) ---
try {
  console.log("Registering API routes with /api/api/ prefix workaround...");
  app.use("/api/api/usuarios", usuariosRoute);
  app.use("/api/api/login", loginRoute);
  app.use("/api/api", datosPersonalesRoute);
  app.use("/api/api/formacion-academica", formacionAcademicaRoute);
  app.use("/api/api", hojaVidaRoute);
  app.use("/api/api/experiencia", experienciaRoutes);
  app.use("/api/api/experiencia-tot", experienciaTotRoutes);
  app.use("/api/api/firma-servidor", firmaServidorRoutes);
  app.use('/api/api/pdf', pdfRoutes);
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

export default app;
