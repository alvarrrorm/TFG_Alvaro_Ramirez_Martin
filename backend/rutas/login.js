const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

router.post('/', async (req, res) => {
  const conexion = req.app.get('conexion');
  const { usuario, pass } = req.body;

  // Validación de campos
  if (!usuario || !pass) {
    return res.status(400).json({ error: 'Por favor, rellena todos los campos' });
  }

  try {
    // Buscar el usuario en la base de datos
    const sql = 'SELECT * FROM usuarios WHERE usuario = ?';
    conexion.query(sql, [usuario], async (err, results) => {
      if (err) {
        console.error('Error al buscar el usuario:', err);
        return res.status(500).json({ error: 'Error al procesar la solicitud' });
      }

      // Si no se encuentra el usuario
      if (results.length === 0) {
        return res.status(401).json({ error: 'Usuario no encontrado' });
      }

      const usuarioEncontrado = results[0];

      // Comparar la contraseña proporcionada con la almacenada en la base de datos
      const coincide = await bcrypt.compare(pass, usuarioEncontrado.pass);

      if (coincide) {
        // Si las contraseñas coinciden
        return res.status(200).json({
          mensaje: 'Inicio de sesión exitoso',
          usuario: {
            id: usuarioEncontrado.id,
            nombre: usuarioEncontrado.nombre,
            correo: usuarioEncontrado.correo,
            usuario: usuarioEncontrado.usuario,
          }
        });
      } else {
        // Si la contraseña no coincide
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      }
    });

  } catch (error) {
    console.error('Error al procesar el login:', error);
    res.status(500).json({ error: 'Error interno al procesar el login' });
  }
});

module.exports = router;
