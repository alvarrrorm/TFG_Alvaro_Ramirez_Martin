const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

// Crear conexión MySQL
const conexion = mysql.createConnection({
  host: 'centerbeam.proxy.rlwy.net',
  user: 'root',
  password: 'xdLWuguiQjCNZrEQffZEpJbBjSeRwYlr',
  database: 'gestion_polideportivo'
});

// Conectar a la base de datos
conexion.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    process.exit(1);
  }
  console.log('Conectado a la base de datos MySQL');
});

// Crear instancia de Express
const app = express();

// Guardar la conexión en app para acceder desde rutas
app.set('conexion', conexion);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

// Iniciar servidor
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Cerrar conexión al terminar
process.on('SIGINT', () => {
  conexion.end();
  process.exit();
});