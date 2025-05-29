const express = require('express');
const router = express.Router();

// Obtener todas las pistas
router.get('/', (req, res) => {
  const conexion = req.app.get('conexion');

  conexion.query('SELECT * FROM pistas ORDER BY id', (error, results) => {
    if (error) {
      console.error('Error al obtener pistas:', error);
      return res.status(500).json({ error: 'Error al obtener pistas' });
    }

    const pistas = results.map(pista => ({
      id: pista.id,
      nombre: pista.nombre,
      tipo: pista.tipo,
      precio: pista.precio,
      disponible: pista.disponible,
      enMantenimiento: pista.disponible === 0
    }));

    res.json(pistas);
  });
});

// Agregar nueva pista (con validación de nombre duplicado)
router.post('/', (req, res) => {
  const { nombre, tipo, precio } = req.body;
  const conexion = req.app.get('conexion');

  if (!nombre || !tipo || precio === undefined) {
    return res.status(400).json({ error: 'Nombre, tipo y precio son obligatorios' });
  }

  if (isNaN(parseFloat(precio))) {
    return res.status(400).json({ error: 'El precio debe ser un número válido' });
  }

  const sql = "SELECT * FROM pistas WHERE nombre COLLATE utf8mb4_general_ci = ?";

  conexion.query(sql, [nombre], (error, results) => {
    if (error) {
      console.error('Error al verificar pista existente:', error);
      return res.status(500).json({ error: 'Error al verificar pista existente' });
    }

    if (results.length > 0) {
      return res.status(409).json({ error: 'Ya existe una pista con ese nombre' });
    }

    // Insertar nueva pista
    conexion.query(
      'INSERT INTO pistas (nombre, tipo, precio, disponible) VALUES (?, ?, ?, ?)',
      [nombre, tipo, parseFloat(precio), 1],
      (error, results) => {
        if (error) {
          console.error('Error al agregar pista:', error);
          return res.status(500).json({ error: 'Error al agregar pista' });
        }

        res.status(201).json({
          id: results.insertId,
          nombre,
          tipo,
          precio: parseFloat(precio),
          disponible: 1,
          enMantenimiento: false
        });
      }
    );
  });
});

// Actualizar estado de mantenimiento
router.patch('/:id/mantenimiento', (req, res) => {
  const { id } = req.params;
  const { enMantenimiento } = req.body;
  const conexion = req.app.get('conexion');

  if (typeof enMantenimiento !== 'boolean') {
    return res.status(400).json({ error: 'enMantenimiento debe ser booleano' });
  }

  const disponible = enMantenimiento ? 0 : 1;

  conexion.query(
    'UPDATE pistas SET disponible = ? WHERE id = ?',
    [disponible, id],
    (error) => {
      if (error) {
        console.error('Error al actualizar pista:', error);
        return res.status(500).json({ error: 'Error al actualizar pista' });
      }

      conexion.query(
        'SELECT * FROM pistas WHERE id = ?',
        [id],
        (error, results) => {
          if (error || results.length === 0) {
            return res.status(404).json({ error: 'Pista no encontrada' });
          }

          const pistaActualizada = results[0];
          res.json({
            id: pistaActualizada.id,
            nombre: pistaActualizada.nombre,
            tipo: pistaActualizada.tipo,
            precio: pistaActualizada.precio,
            disponible: pistaActualizada.disponible,
            enMantenimiento: pistaActualizada.disponible === 0
          });
        }
      );
    }
  );
});

// Actualizar precio de la pista - Ruta corregida
router.patch('/:id/precio', (req, res) => {
  const { id } = req.params;
  const { precio } = req.body;
  const conexion = req.app.get('conexion');

  if (precio === undefined || isNaN(parseFloat(precio))) {
    return res.status(400).json({ error: 'Precio debe ser un número válido' });
  }

  conexion.query(
    'UPDATE pistas SET precio = ? WHERE id = ?',
    [parseFloat(precio), id],
    (error, results) => {
      if (error) {
        console.error('Error al actualizar precio:', error);
        return res.status(500).json({ error: 'Error al actualizar precio' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Pista no encontrada' });
      }

      conexion.query(
        'SELECT * FROM pistas WHERE id = ?',
        [id],
        (error, results) => {
          if (error || results.length === 0) {
            return res.status(404).json({ error: 'Pista no encontrada' });
          }

          const pistaActualizada = results[0];
          res.json({
            id: pistaActualizada.id,
            nombre: pistaActualizada.nombre,
            tipo: pistaActualizada.tipo,
            precio: pistaActualizada.precio,
            disponible: pistaActualizada.disponible,
            enMantenimiento: pistaActualizada.disponible === 0
          });
        }
      );
    }
  );
});

// Eliminar pista
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const conexion = req.app.get('conexion');

  conexion.query(
    'DELETE FROM pistas WHERE id = ?',
    [id],
    (error, results) => {
      if (error) {
        console.error('Error al eliminar pista:', error);
        return res.status(500).json({ error: 'Error al eliminar pista' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Pista no encontrada' });
      }

      res.json({ message: 'Pista eliminada correctamente' });
    }
  );
});

module.exports = router;