const express = require('express');
const router = express.Router();

// Crear una reserva
router.post('/', (req, res) => {
  const db = req.app.get('conexion');

  const {
    dni_usuario,
    nombre_usuario,
    pista,      // id numérico de la pista
    fecha,
    hora_inicio,
    hora_fin,
    ludoteca = false,
    estado = 'pendiente'
  } = req.body;

  if (!dni_usuario || !nombre_usuario || !pista || !fecha || !hora_inicio || !hora_fin) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }

  const pistaId = Number(pista);
  if (isNaN(pistaId)) {
    return res.status(400).json({ message: 'ID de pista inválido' });
  }

  // Comprobar disponibilidad
  const comprobarDisponibilidadSQL = `
    SELECT * FROM reservas 
    WHERE pista = ? AND fecha = ? AND (
      (hora_inicio < ? AND hora_fin > ?) OR
      (hora_inicio >= ? AND hora_inicio < ?) OR
      (hora_fin > ? AND hora_fin <= ?)
    )
  `;

  db.query(
    comprobarDisponibilidadSQL,
    [pistaId, fecha, hora_fin, hora_inicio, hora_inicio, hora_fin, hora_inicio, hora_fin],
    (err, results) => {
      if (err) {
        console.error('Error al comprobar disponibilidad:', err);
        return res.status(500).json({ message: 'Error al comprobar disponibilidad' });
      }

      if (results.length > 0) {
        return res.status(409).json({ message: 'La pista no está disponible en el horario seleccionado' });
      }

      // Obtener precio de la pista
      const precioSQL = `SELECT precio FROM pistas WHERE id = ? LIMIT 1`;

      db.query(precioSQL, [pistaId], (err, rows) => {
        if (err) {
          console.error('Error al obtener precio:', err);
          return res.status(500).json({ message: 'Error al obtener precio de la pista' });
        }

        if (rows.length === 0) {
          return res.status(404).json({ message: 'Precio no encontrado para la pista' });
        }

        const precioHora = parseFloat(rows[0].precio);

        // Calcular duración en horas
        const [hInicio, mInicio] = hora_inicio.split(':').map(Number);
        const [hFin, mFin] = hora_fin.split(':').map(Number);
        const duracion = ((hFin * 60 + mFin) - (hInicio * 60 + mInicio)) / 60;

        if (duracion <= 0) {
          return res.status(400).json({ message: 'La hora de fin debe ser posterior a la hora de inicio' });
        }

        const precioTotal = precioHora * duracion;

        const insertSQL = `
          INSERT INTO reservas 
          (dni_usuario, nombre_usuario, pista, fecha, hora_inicio, hora_fin, ludoteca, estado, precio, fecha_creacion)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        db.query(
          insertSQL,
          [dni_usuario, nombre_usuario, pistaId, fecha, hora_inicio, hora_fin, ludoteca, estado, precioTotal],
          (err, result) => {
            if (err) {
              console.error('Error al insertar reserva:', err);
              return res.status(500).json({ message: 'Error al insertar reserva' });
            }

            // Devolver reserva creada con datos de pista
            const selectSQL = `
              SELECT r.*, p.nombre AS nombre_pista, p.tipo AS tipo_pista
              FROM reservas r
              LEFT JOIN pistas p ON r.pista = p.id
              WHERE r.id = ?
            `;

            db.query(selectSQL, [result.insertId], (err, rows) => {
              if (err) {
                console.error('Error al obtener reserva creada:', err);
                return res.status(500).json({ message: 'Error al obtener reserva creada' });
              }
              if (rows.length === 0) {
                return res.status(404).json({ message: 'Reserva no encontrada después de crearla' });
              }
              console.log('Reserva creada:', rows[0]);
              res.status(201).json(rows[0]);
            });
          }
        );
      });
    }
  );
});

// Listar todas las reservas
router.get('/', (req, res) => {
  const db = req.app.get('conexion');

  const sql = `
    SELECT r.*, p.nombre AS nombre_pista, p.tipo AS tipo_pista
    FROM reservas r
    LEFT JOIN pistas p ON r.pista = p.id
    ORDER BY r.fecha_creacion DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener reservas:', err);
      return res.status(500).json({ message: 'Error al obtener reservas' });
    }
    res.json(results);
  });
});

// Eliminar una reserva por id
router.delete('/:id', (req, res) => {
  const db = req.app.get('conexion');
  const { id } = req.params;

  // Primero obtener la reserva para devolver info luego
  const selectSQL = `
    SELECT r.*, p.nombre AS nombre_pista
    FROM reservas r
    LEFT JOIN pistas p ON r.pista = p.id
    WHERE r.id = ?
  `;

  db.query(selectSQL, [id], (err, rows) => {
    if (err) {
      console.error('Error al obtener reserva:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    const reserva = rows[0];

    // Ahora borrar la reserva
    const deleteSQL = 'DELETE FROM reservas WHERE id = ?';

    db.query(deleteSQL, [id], (err, result) => {
      if (err) {
        console.error('Error al eliminar reserva:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }

      // Devolver datos de la reserva borrada
      res.json({
        message: 'Reserva eliminada correctamente',
        reserva: {
          id: reserva.id,
          nombre_pista: reserva.nombre_pista,
          fecha: reserva.fecha,
          precio: reserva.precio,
          estado: reserva.estado,
        }
      });
    });
  });
});


router.put('/:id/estado', (req, res) => {
  const db = req.app.get('conexion');  // obtener conexión a DB desde app
  const { id } = req.params;
  const { estado } = req.body;

  if (!id) {
    return res.status(400).json({ mensaje: 'Id de reserva requerido' });
  }
  if (!estado) {
    return res.status(400).json({ mensaje: 'El estado es requerido' });
  }

  const sql = 'UPDATE reservas SET estado = ? WHERE id = ?';

  db.query(sql, [estado, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar estado:', err);
      return res.status(500).json({ mensaje: 'Error al actualizar el estado' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Reserva no encontrada' });
    }

    res.json({ mensaje: 'Estado actualizado correctamente' });
  });
});



module.exports = router;






