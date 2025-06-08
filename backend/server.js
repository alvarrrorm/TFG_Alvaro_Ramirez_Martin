require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

// Crear conexión MySQL usando variables de entorno
const conexion = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'qwerty',
  database: process.env.DB_NAME || 'gestion_polideportivo',
  port: process.env.DB_PORT || 3306,
});

// Conectar a la base de datos
conexion.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos:', err);
    process.exit(1);
  }
  console.log('✅ Conectado a la base de datos MySQL');
});

// Crear instancia de Express
const app = express();

// Guardar la conexión en app para acceder desde rutas
app.set('conexion', conexion);

// Middleware CORS - debe ir antes que las rutas
app.use(
  cors({
    origin: 'https://tfgalvaroramirezmartin-production.up.railway.app',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Manejar peticiones OPTIONS para todas las rutas (preflight)
app.options('*', cors());

// Middlewares para parsear JSON y datos urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
const loginRuta = require('./rutas/login');
const registroRuta = require('./rutas/registro');
const pistasRuta = require('./rutas/pistas');
const reservasRuta = require('./rutas/reservas');

app.use('/login', loginRuta);
app.use('/registro', registroRuta);
app.use('/pistas', pistasRuta);
app.use('/reservas', reservasRuta);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API del Polideportivo');
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001; // Railway usa la variable PORT
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});

// Cerrar conexión al terminar el proceso
process.on('SIGINT', () => {
  conexion.end();
  process.exit();
});
