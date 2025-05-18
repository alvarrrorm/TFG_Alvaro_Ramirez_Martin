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
    
    // Transformar resultados para el frontend
    const pistas = results.map(pista => ({
      id: pista.id,
      nombre: pista.nombre,
      tipo: pista.tipo,
      disponible: pista.disponible,
      enMantenimiento: pista.disponible === 0
    }));
    
    res.json(pistas);
  });
});

// Agregar nueva pista
router.post('/', (req, res) => {
  const { nombre, tipo } = req.body;
  const conexion = req.app.get('conexion');

  if (!nombre || !tipo) {
    return res.status(400).json({ error: 'Nombre y tipo son obligatorios' });
  }

  conexion.query(
    'INSERT INTO pistas (nombre, tipo, disponible) VALUES (?, ?, ?)',
    [nombre, tipo, 1], 
    (error, results) => {
      if (error) {
        console.error('Error al agregar pista:', error);
        return res.status(500).json({ error: 'Error al agregar pista' });
      }
      
      res.status(201).json({
        id: results.insertId,
        nombre,
        tipo,
        disponible: 1,
        enMantenimiento: false
      });
    }
  );
});

// Actualizar estado de mantenimiento
router.patch('/:id', (req, res) => {
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
      
      // Obtener la pista actualizada para devolverla
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