const mysql = require('mysql2');

// Crear conexión usando variables de entorno
const conexion = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gestion_polideportivo',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4',
});

// Conectar a la base de datos
conexion.connect((err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err);
  } else {
    console.log('Conectado correctamente a la base de datos');
  }
});

module.exports = {
  conexion,
  promiseConexion: conexion.promise()
};
