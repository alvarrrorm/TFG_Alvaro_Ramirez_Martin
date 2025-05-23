const express = require('express');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

// Crear conexión MySQL
const conexion = mysql.createConnection({
  host: '51.44.193.22',
  user: 'root',
  password: '5Alvarorm.!',
  database: 'gestion_polideportivo',
  charset: 'utf8mb4',
  // collation no es opción válida para mysql2 connection, mejor quitarla para evitar warnings
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

app.get('/', (req, res) => {
  res.send('API del Polideportivo funcionando con HTTPS');
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('❌ Error no controlado:', err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

// Leer certificados SSL
const sslOptions = {
  key: fs.readFileSync('./ssl/key.pem'),
  cert: fs.readFileSync('./ssl/cert.pem'),
};

const PORT = 3001;
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`🚀 Servidor HTTPS escuchando en https://51.44.193.22:${PORT}`);
});

// Cerrar conexión MySQL al cerrar servidor
process.on('SIGINT', () => {
  conexion.end(() => {
    console.log('🔌 Conexión MySQL cerrada');
    process.exit();
  });
});