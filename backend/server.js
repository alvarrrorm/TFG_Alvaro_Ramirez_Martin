const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql');

// Crear conexión MySQL
const conexion = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'qwerty',
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

// Rutas
const loginRuta = require('./rutas/login');
const registroRuta = require('./rutas/registro');
const pistasRuta = require('./rutas/pistas');  // <--- Importa aquí

app.use('/login', loginRuta);
app.use('/registro', registroRuta);
app.use('/pistas', pistasRuta);  // <--- Usa la ruta aquí

// Iniciar servidor
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
