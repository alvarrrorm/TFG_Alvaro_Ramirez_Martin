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

// Función para usar Promesas con la consulta MySQL
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

  // Validación básica de campos
  if (!nombre || !correo || !usuario || !dni || !telefono || !pass || !pass_2) {
    return res.status(400).json({ error: 'Por favor, rellena todos los campos' });
  }

  // Validar DNI
  if (!validarDNI(dni)) {
    return res.status(400).json({ error: 'DNI no válido' });
  }

  // Validar teléfono (solo dígitos, 9 a 15 caracteres)
  if (!/^\d{9,15}$/.test(telefono)) {
    return res.status(400).json({ error: 'Número de teléfono no válido. Debe contener entre 9 y 15 dígitos' });
  }

  // Validar coincidencia de contraseñas
  if (pass !== pass_2) {
    return res.status(400).json({ error: 'Las contraseñas no coinciden' });
  }

  // Definir rol
  const rol = clave_admin === CLAVE_ADMIN ? 'admin' : 'usuario';

  try {
    // Comprobar si DNI ya existe
    let resultados = await queryPromesa(conexion, 'SELECT id FROM usuarios WHERE dni = ?', [dni]);
    if (resultados.length > 0) {
      return res.status(400).json({ error: 'El DNI ya está registrado' });
    }

    // Comprobar si correo ya existe
    resultados = await queryPromesa(conexion, 'SELECT id FROM usuarios WHERE correo = ?', [correo]);
    if (resultados.length > 0) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    // Comprobar si usuario ya existe
    resultados = await queryPromesa(conexion, 'SELECT id FROM usuarios WHERE usuario = ?', [usuario]);
    if (resultados.length > 0) {
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    }

    // Encriptar contraseña
    const hashedPass = await bcrypt.hash(pass, 10);

    // Insertar usuario nuevo
    const sql = 'INSERT INTO usuarios (nombre, correo, usuario, dni, pass, rol, telefono) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const valores = [nombre, correo, usuario, dni, hashedPass, rol, telefono];

    await queryPromesa(conexion, sql, valores);

    // Responder éxito
    return res.json({ success: true, mensaje: `Usuario registrado correctamente como ${rol}` });
  } catch (error) {
    console.error('Error en el registro:', error);
    return res.status(500).json({ error: 'Error interno al registrar el usuario' });
  }
});

module.exports = router;
