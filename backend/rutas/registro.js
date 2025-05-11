const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

const CLAVE_ADMIN = 'admin1234';

function validarDNI(dni) {
  const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const dniRegex = /^(\d{8})([A-Z])$/i;

  const match = dni.match(dniRegex);
  if (!match) return false;

  const numero = parseInt(match[1], 10);
  const letra = match[2].toUpperCase();
  const letraCalculada = letras[numero % 23];

  return letra === letraCalculada;
}

router.post('/', async (req, res) => {
  const conexion = req.app.get('conexion');
  const { nombre, correo, usuario, dni, pass, pass_2, clave_admin } = req.body;

  // Validación de campos
  if (!nombre || !correo || !usuario || !dni || !pass || !pass_2) {
    return res.status(400).json({ error: 'Por favor, rellena todos los campos' });
  }

  if (!validarDNI(dni)) {
    return res.status(400).json({ error: 'DNI no válido' });
  }

  if (pass !== pass_2) {
    return res.status(400).json({ error: 'Las contraseñas no coinciden' });
  }

  const rol = clave_admin === CLAVE_ADMIN ? 'admin' : 'usuario';

  try {
    const hashedPass = await bcrypt.hash(pass, 10);
    const sql = 'INSERT INTO usuarios (nombre, correo, usuario, dni, pass, rol) VALUES (?, ?, ?, ?, ?, ?)';
    const valores = [nombre, correo, usuario, dni, hashedPass, rol];

    conexion.query(sql, valores, (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Usuario o DNI ya registrados' });
        }
        console.error('Error al insertar el usuario:', err);
        return res.status(500).json({ error: 'Error al registrar el usuario' });
      }


      res.json({ mensaje: `Usuario registrado correctamente como ${rol}` });
    });

  } catch (error) {
    console.error('Error al encriptar la contraseña:', error);
    res.status(500).json({ error: 'Error interno al registrar el usuario' });
  }
});

module.exports = router;
