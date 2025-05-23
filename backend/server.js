const express = require('express');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

// Crear conexión a MySQL
const conexion = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '5Alvarorm.!',
  database: 'gestion_polideportivo',
  charset: 'utf8mb4',
});

conexion.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos:', err);
    process.exit(1);
  }
  console.log('✅ Conectado a la base de datos MySQL');
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
  res.send('🚀 API del Polideportivo funcionando en HTTPS');
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('❌ Error no controlado:', err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

// Crear servidor HTTPS
const sslOptions = {
  key: fs.readFileSync('/etc/letsencrypt/live/deppo.es/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/deppo.es/fullchain.pem'),
};

https.createServer(sslOptions, app).listen(443, () => {
  console.log('🚀 Servidor HTTPS escuchando en https://deppo.es');
});
