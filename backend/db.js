// db.js
const mysql = require('mysql2');

const conexion = mysql.createConnection({
  host: 'mysql.railway.internal',
  user: 'root',
  password: 'xdLWuguiQjCNZrEQffZEpJbBjSeRwYlr',
  database: 'gestion_polideportivo',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4',
});

conexion.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar con la base de datos:', err);
  } else {
    console.log('✅ Conectado correctamente a la base de datos');
  }
});

module.exports = {
  conexion,
  promiseConexion: conexion.promise(),
};
