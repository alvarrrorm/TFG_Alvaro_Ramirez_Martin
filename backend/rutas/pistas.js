const express = require('express');
const router = express.Router();

// Obtener todas las pistas
router.get('/', (req, res) => {
  const conexion = req.app.get('conexion');

  conexion.query('SELECT * FROM pistas ORDER BY id', (error, results) => {
    if (error) {
      console.error('Error al obtener pistas:', error);
      return res.status(500).json({ success: false, error: 'Error al obtener pistas' });
    }

    const pistas = results.map(p => ({
      id: p.id,
      nombre: p.nombre,
      tipo: p.tipo,
      precio: parseFloat(p.precio),
      disponible: p.disponible === 1,
      enMantenimiento: p.disponible === 0
    }));

    res.json({ success: true, data: pistas });
  });
});

// Obtener pistas disponibles
router.get('/disponibles', (req, res) => {
  const conexion = req.app.get('conexion');

  conexion.query('SELECT * FROM pistas WHERE disponible = 1 ORDER BY id', (error, results) => {
    if (error) {
      console.error('Error al obtener pistas disponibles:', error);
      return res.status(500).json({ success: false, error: 'Error al obtener pistas disponibles' });
    }

    const pistas = results.map(p => ({
      id: p.id,
      nombre: p.nombre,
      tipo: p.tipo,
      precio: parseFloat(p.precio),
      disponible: true,
      enMantenimiento: false
    }));

    res.json({ success: true, data: pistas });
  });
});

// Agregar pista
router.post('/', (req, res) => {
  const { nombre, tipo, precio } = req.body;
  const conexion = req.app.get('conexion');

  if (!nombre || !tipo || precio === undefined || isNaN(precio)) {
    return res.status(400).json({ success: false, error: 'Datos inválidos' });
  }

  conexion.query(
    'SELECT * FROM pistas WHERE nombre COLLATE utf8mb4_general_ci = ?',
    [nombre],
    (error, results) => {
      if (error) {
        return res.status(500).json({ success: false, error: 'Error al verificar pista' });
      }

      if (results.length > 0) {
        return res.status(409).json({ success: false, error: 'Nombre duplicado' });
      }

      const precioParsed = parseFloat(precio);

      conexion.query(
        'INSERT INTO pistas (nombre, tipo, precio, disponible) VALUES (?, ?, ?, 1)',
        [nombre, tipo, precioParsed],
        (error, result) => {
          if (error) {
            return res.status(500).json({ success: false, error: 'Error al agregar pista' });
          }

          res.status(201).json({
            success: true,
            data: {
              id: result.insertId,
              nombre,
              tipo,
              precio: precioParsed,
              disponible: true,
              enMantenimiento: false
            }
          });
        }
      );
    }
  );
});

// Cambiar estado mantenimiento
router.patch('/:id/mantenimiento', (req, res) => {
  const { id } = req.params;
  const { enMantenimiento } = req.body;
  const conexion = req.app.get('conexion');

  if (typeof enMantenimiento !== 'boolean') {
    return res.status(400).json({ success: false, error: 'enMantenimiento debe ser booleano' });
  }

  const disponible = enMantenimiento ? 0 : 1;

  conexion.query(
    'UPDATE pistas SET disponible = ? WHERE id = ?',
    [disponible, id],
    (error, result) => {
      if (error) {
        return res.status(500).json({ success: false, error: 'Error al actualizar mantenimiento' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, error: 'Pista no encontrada' });
      }

      conexion.query('SELECT * FROM pistas WHERE id = ?', [id], (error, results) => {
        if (error || results.length === 0) {
          return res.status(500).json({ success: false, error: 'Error al obtener pista' });
        }

        const p = results[0];

        res.json({
          success: true,
          data: {
            id: p.id,
            nombre: p.nombre,
            tipo: p.tipo,
            precio: parseFloat(p.precio),
            disponible: p.disponible === 1,
            enMantenimiento: p.disponible === 0
          }
        });
      });
    }
  );
});

// Actualizar precio
router.patch('/:id/precio', (req, res) => {
  const { id } = req.params;
  const { precio } = req.body;
  const conexion = req.app.get('conexion');

  if (precio === undefined || isNaN(precio)) {
    return res.status(400).json({ success: false, error: 'Precio inválido' });
  }

  const precioParsed = parseFloat(precio);

  conexion.query('UPDATE pistas SET precio = ? WHERE id = ?', [precioParsed, id], (error, result) => {
    if (error) {
      return res.status(500).json({ success: false, error: 'Error al actualizar precio' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Pista no encontrada' });
    }

    conexion.query('SELECT * FROM pistas WHERE id = ?', [id], (error, results) => {
      if (error || results.length === 0) {
        return res.status(500).json({ success: false, error: 'Error al obtener pista' });
      }

      const p = results[0];

      res.json({
        success: true,
        data: {
          id: p.id,
          nombre: p.nombre,
          tipo: p.tipo,
          precio: parseFloat(p.precio),
          disponible: p.disponible === 1,
          enMantenimiento: p.disponible === 0
        }
      });
    });
  });
});

// Eliminar pista
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const conexion = req.app.get('conexion');

  conexion.query('DELETE FROM pistas WHERE id = ?', [id], (error, result) => {
    if (error) {
      console.error('Error al eliminar pista:', error);
      return res.status(500).json({ success: false, error: 'Error al eliminar pista' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Pista no encontrada' });
    }

    res.json({ success: true, message: 'Pista eliminada correctamente' });
  });
});

module.exports = router;
