const express = require('express');
const router = express.Router();
const db = require('../conexion'); // Asegúrate de tener tu conexión a la base de datos configurada

// Crear una nueva reserva
router.post('/', async (req, res) => {
  const {
    dni_usuario,
    nombre_usuario,
    pista,
    fecha,
    hora_inicio,
    hora_fin,
    ludoteca = false,
    estado = 'pendiente'
  } = req.body;

  // Validaciones básicas
  if (!dni_usuario || !nombre_usuario || !pista || !fecha || !hora_inicio || !hora_fin) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }

  try {
    // Verificar disponibilidad de la pista
    const disponibilidad = await db.query(
      `SELECT * FROM reservas 
       WHERE pista = ? AND fecha = ? AND (
         (hora_inicio < ? AND hora_fin > ?) OR
         (hora_inicio >= ? AND hora_inicio < ?) OR
         (hora_fin > ? AND hora_fin <= ?)
       )`,
      [pista, fecha, hora_fin, hora_inicio, hora_inicio, hora_fin, hora_inicio, hora_fin]
    );

    if (disponibilidad.length > 0) {
      return res.status(409).json({ 
        message: 'La pista no está disponible en el horario seleccionado' 
      });
    }

    // Insertar la reserva
    const result = await db.query(
      `INSERT INTO reservas 
       (dni_usuario, nombre_usuario, pista, fecha, hora_inicio, hora_fin, ludoteca, estado, fecha_creacion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [dni_usuario, nombre_usuario, pista, fecha, hora_inicio, hora_fin, ludoteca, estado]
    );

    // Obtener la reserva creada
    const nuevaReserva = await db.query(
      'SELECT * FROM reservas WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(nuevaReserva[0]);
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ message: 'Error al crear la reserva' });
  }
});

// Obtener todas las reservas
router.get('/', async (req, res) => {
  try {
    const reservas = await db.query('SELECT * FROM reservas ORDER BY fecha, hora_inicio');
    res.json(reservas);
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ message: 'Error al obtener reservas' });
  }
});

// Obtener reservas por usuario
router.get('/usuario/:dni', async (req, res) => {
  try {
    const reservas = await db.query(
      'SELECT * FROM reservas WHERE dni_usuario = ? ORDER BY fecha DESC, hora_inicio DESC',
      [req.params.dni]
    );
    res.json(reservas);
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ message: 'Error al obtener reservas' });
  }
});

// Cancelar una reserva
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM reservas WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    res.json({ message: 'Reserva cancelada correctamente' });
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    res.status(500).json({ message: 'Error al cancelar la reserva' });
  }
});

module.exports = router;