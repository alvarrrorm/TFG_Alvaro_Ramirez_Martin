const express = require('express');
const router = express.Router();

// Obtener todas las pistas
router.get('/', (req, res) => {
  const conexion = req.app.get('conexion');
  const sql = 'SELECT * FROM pistas ORDER BY id';
  conexion.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener pistas:', err);
      return res.status(500).json({ error: 'Error al obtener pistas' });
    }
    const pistas = results.map(pista => ({
      ...pista,
      enMantenimiento: pista.enMantenimiento === 1,
      disponible: pista.enMantenimiento === 0 
    }));
    res.json(pistas);
  });
});

// Agregar nueva pista
router.post('/', (req, res) => {
  const conexion = req.app.get('conexion');
  const { nombre, tipo } = req.body;

  if (!nombre || !tipo) {
    return res.status(400).json({ error: 'Nombre y tipo son obligatorios' });
  }

  // Por defecto, nueva pista no está en mantenimiento
  const enMantenimiento = false;

  const sql = 'INSERT INTO pistas (nombre, tipo, enMantenimiento) VALUES (?, ?, ?)';
  conexion.query(sql, [nombre, tipo, enMantenimiento ? 1 : 0], (err, result) => {
    if (err) {
      console.error('Error al agregar pista:', err);
      return res.status(500).json({ error: 'Error al agregar pista' });
    }
    const nuevaPista = {
      id: result.insertId,
      nombre,
      tipo,
      enMantenimiento,
      disponible: !enMantenimiento
    };
    res.status(201).json(nuevaPista);
  });
});

// Actualizar estado mantenimiento (PATCH)
router.patch('/:id', (req, res) => {
  const conexion = req.app.get('conexion');
  const { id } = req.params;
  const { enMantenimiento } = req.body;

  if (typeof enMantenimiento !== 'boolean') {
    return res.status(400).json({ error: 'El campo enMantenimiento debe ser booleano' });
  }

  const sql = 'UPDATE pistas SET enMantenimiento = ? WHERE id = ?';
  conexion.query(sql, [enMantenimiento ? 1 : 0, id], (err) => {
    if (err) {
      console.error('Error al actualizar pista:', err);
      return res.status(500).json({ error: 'Error al actualizar pista' });
    }

    const sqlGet = 'SELECT * FROM pistas WHERE id = ?';
    conexion.query(sqlGet, [id], (err2, results) => {
      if (err2) {
        console.error('Error al obtener pista actualizada:', err2);
        return res.status(500).json({ error: 'Error al obtener pista actualizada' });
      }
      if (results.length === 0) return res.status(404).json({ error: 'Pista no encontrada' });

      const pistaActualizada = {
        ...results[0],
        enMantenimiento: results[0].enMantenimiento === 1,
        disponible: results[0].enMantenimiento === 0
      };
      res.json(pistaActualizada);
    });
  });
});

// Eliminar pista
router.delete('/:id', (req, res) => {
  const conexion = req.app.get('conexion');
  const { id } = req.params;

  const sql = 'DELETE FROM pistas WHERE id = ?';
  conexion.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar pista:', err);
      return res.status(500).json({ error: 'Error al eliminar pista' });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Pista no encontrada' });
    res.json({ message: 'Pista eliminada correctamente' });
  });
});

module.exports = router;