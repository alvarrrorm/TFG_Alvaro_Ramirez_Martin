const mysql = require('mysql2');

// Configuración de la conexión a MySQL desde variables de entorno
const conexion = mysql.createConnection({
  host: mysql.railway.internal,
  user: root,
  password: xdLWuguiQjCNZrEQffZEpJbBjSeRwYlr,
  database:gestion_polideportivo,
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4',
});
// Intentar conectar
conexion.connect((err) => {
  if (err) {
    console.error('❌ Error conectando a MySQL:', err);
    return;
  }
  console.log('✅ Conectado a la base de datos MySQL');
});

// Ejemplo de consulta simple
conexion.query('SELECT NOW() AS fecha_actual', (err, results) => {
  if (err) {
    console.error('Error en la consulta:', err);
    return;
  }
  console.log('🕒 Fecha actual desde MySQL:', results[0].fecha_actual);
  conexion.end();
});
