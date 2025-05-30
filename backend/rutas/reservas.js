const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  const db = req.app.get('conexion');

  const {
    dni_usuario,
    nombre_usuario,
    pista,      // Aquí esperamos que sea el id numérico de la pista
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

      // Obtener precio de la pista por id
      const precioSQL = `SELECT precio FROM pistas WHERE id = ? LIMIT 1`;

      db.query(precioSQL, [pistaId], (err, rows) => {
        if (err) {
          console.error('Error al obtener precio:', err);
          return res.status(500).json({ message: 'Error al obtener precio de la pista' });
        }

        if (rows.length === 0) {
          console.error('No se encontró precio para pista con id:', pistaId);
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

            // Devolver reserva creada
            const selectSQL = `SELECT * FROM reservas WHERE id = ?`;

            db.query(selectSQL, [result.insertId], (err, rows) => {
              if (err) {
                console.error('Error al obtener reserva creada:', err);
                return res.status(500).json({ message: 'Error al obtener reserva creada' });
              }

              res.status(201).json(rows[0]);
            });
          }
        );
      });
    }
  );
});

module.exports = router;
