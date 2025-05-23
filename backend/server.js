const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

// Conexión a MySQL
const conexion = mysql.createConnection({
  host: '51.44.193.22',
  user: 'alvaro',
  password: '5Alvaror.',
  port: 3306,
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

// Ruta simple para testear que el backend funciona
app.get('/', (req, res) => {
  res.send('Backend de gestión polideportivo activo 🚀');
});

// Rutas API
app.use('/login', require('./rutas/login'));
app.use('/registro', require('./rutas/registro'));
app.use('/pistas', require('./rutas/pistas'));

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('❌ Error no controlado:', err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

// SSL certificados Let's Encrypt
const sslOptions = {
  key: fs.readFileSync('/etc/letsencrypt/live/deppo.es/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/deppo.es/fullchain.pem'),
};

// Servidor HTTPS
https.createServer(sslOptions, app).listen(443, () => {
  console.log('🚀 Servidor HTTPS escuchando en https://deppo.es');
});

// Redirigir HTTP a HTTPS
http.createServer((req, res) => {
  const host = req.headers['host'].replace(/:\d+$/, '');
  res.writeHead(301, { Location: `https://${host}${req.url}` });
  res.end();
}).listen(80, () => {
  console.log('🔄 Servidor HTTP escuchando en puerto 80 y redirigiendo a HTTPS');
});
