const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

// Importar las rutas
const loginRuta = require('./rutas/login');
const registerRuta = require('./rutas/registro');

// Configuración de Express
const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Configuración de la conexión a la base de datos
const conexion = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "qwerty",
  database: "gestion_polideportivo"
});

conexion.connect((err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos');
});

// Guardar la conexión para ser accesible desde otras rutas
app.set('conexion', conexion);

// Usar las rutas
app.use('/registro', registerRuta);
app.use('/login', loginRuta);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
