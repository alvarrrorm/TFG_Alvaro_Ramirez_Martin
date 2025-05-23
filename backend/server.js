const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

// Conexión a MySQL (ajusta credenciales)
const conexion = mysql.createConnection({
  host: 'localhost',
  user: 'alvaro',
  password: '5Alvaror.',
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

// Servir archivos estáticos React
app.use(express.static(path.join(__dirname, 'build')));

// Tus rutas API
app.use('/login', require('./rutas/login'));
app.use('/registro', require('./rutas/registro'));
app.use('/pistas', require('./rutas/pistas'));

// Para cualquier ruta que no sea API, servir index.html (React router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

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

// Levantar servidor HTTPS
https.createServer(sslOptions, app).listen(443, () => {
  console.log('🚀 Servidor HTTPS escuchando en https://deppo.es');
});

// Servidor HTTP en puerto 80 para redirigir a HTTPS
http.createServer((req, res) => {
  // Construye la URL para redirigir
  const host = req.headers['host'].replace(/:\d+$/, ''); // elimina puerto si hay
  res.writeHead(301, { Location: `https://${host}${req.url}` });
  res.end();
}).listen(80, () => {
  console.log('🔄 Servidor HTTP escuchando en puerto 80 y redirigiendo a HTTPS');
}); 