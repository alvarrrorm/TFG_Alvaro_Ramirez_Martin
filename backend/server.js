const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

// Crear conexión MySQL
const conexion = mysql.createConnection({
  host: '51.44.193.22',
  user: 'Alvaro',
  password: '5Alvarorm.!',
  database: 'gestion_polideportivo',
  charset: 'utf8mb4',
  collation: 'utf8mb4_general_ci'
});

conexion.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos:', err);
    process.exit(1);
  }
  console.log('✅ Conectado a la base de datos MySQL');
});

conexion.on('error', (err) => {
  console.error('❌ Error en la conexión MySQL:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('🔄 Conexión MySQL perdida. Deberías reiniciar el servidor.');
  } else {
    throw err;
  }
});

const app = express();
app.set('conexion', conexion);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rutas
app.use('/login', require('./rutas/login'));
app.use('/registro', require('./rutas/registro'));
app.use('/pistas', require('./rutas/pistas'));

// Ruta raíz
app.get('/', (req, res) => {
  res.send('API del Polideportivo funcionando');
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('❌ Error no controlado:', err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

// Escuchar en puerto (desde entorno o por defecto 3001)
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});

// Cerrar conexión
process.on('SIGINT', () => {
  conexion.end(() => {
    console.log('🔌 Conexión MySQL cerrada');
    process.exit();
  });
});
