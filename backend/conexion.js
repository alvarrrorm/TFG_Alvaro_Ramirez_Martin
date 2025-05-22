const mysql = require("mysql2");

const conexion = mysql.createConnection({
  host: "51.44.193.22",
  user: "root",
  password: "5Alvarorm.!",
  database: "gestion_polideportivo"
});

conexion.connect((err) => {
  if (err) {
    console.error("Error al conectar con la base de datos:", err);
  } else {
    console.log("Conectado correctamente a la base de datos");
  }
});

module.exports = conexion;
