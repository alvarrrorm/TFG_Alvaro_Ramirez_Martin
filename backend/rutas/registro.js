const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

const CLAVE_ADMIN = 'admin1234'; // Cambia esta clave en producción por una segura y en entorno seguro

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

function queryPromesa(conexion, sql, valores) {
  return new Promise((resolve, reject) => {
    conexion.query(sql, valores, (error, resultados) => {
      if (error) reject(error);
      else resolve(resultados);
    });
  });
}

router.post('/', async (req, res) => {
  const conexion = req.app.get('conexion');
  const { nombre, correo, usuario, dni, telefono, pass, pass_2, clave_admin } = req.body;

  if (!nombre || !correo || !usuario || !dni || !telefono || !pass || !pass_2) {
    return res.status(400).json({ error: 'Por favor, rellena todos los campos' });
  }

  if (!validarDNI(dni)) {
    return res.status(400).json({ error: 'DNI no válido' });
  }

  if (!/^\d{9,15}$/.test(telefono)) {
    return res.status(400).json({ error: 'Número de teléfono no válido. Debe contener entre 9 y 15 dígitos' });
  }

  if (pass !== pass_2) {
    return res.status(400).json({ error: 'Las contraseñas no coinciden' });
  }

  const rol = clave_admin === CLAVE_ADMIN ? 'admin' : 'usuario';

  try {
    let resultados = await queryPromesa(conexion, 'SELECT id FROM usuarios WHERE dni = ?', [dni]);
    if (resultados.length > 0) {
      return res.status(400).json({ error: 'El DNI ya está registrado' });
    }

    resultados = await queryPromesa(conexion, 'SELECT id FROM usuarios WHERE correo = ?', [correo]);
    if (resultados.length > 0) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    resultados = await queryPromesa(conexion, 'SELECT id FROM usuarios WHERE usuario = ?', [usuario]);
    if (resultados.length > 0) {
      return res.status(400).json({ error: 'El nombre de usuario ya está registrado' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(pass, saltRounds);

    await queryPromesa(
      conexion,
      'INSERT INTO usuarios (nombre, correo, usuario, dni, telefono, pass, rol) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nombre, correo, usuario, dni, telefono, hashedPassword, rol]
    );

    return res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (error) {
    console.error('Error en registro:', error);
    return res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
