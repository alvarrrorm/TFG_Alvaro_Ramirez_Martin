const mysql = require('mysql2');

const conexion = mysql.createConnection({
  host: '51.44.193.22',
  user: 'alvaro',
  password: '5Alvaror.',
  port: 3306,
  database: 'gestion_polideportivo',
  charset: 'utf8mb4',
  connectTimeout: 5000, // 5 segundos para no esperar mucho
});

conexion.connect((err) => {
  if (err) {
    console.error('Error conectando a MySQL:', err);
    process.exit(1);
  }
  console.log('Conexión a MySQL exitosa!');
  conexion.end();
});
