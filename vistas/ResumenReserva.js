import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

export default function ResumenReserva({ route, navigation }) {
  const {
    dni,
    nombre,
    pistaId,
    pistaNombre,
    fecha,
    horaInicio,
    horaFin,
    ludoteca,
    duracion,
    precioHora,
    total,
  } = route.params;

  const [loading, setLoading] = useState(false);

  const handleConfirmar = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dni,
          nombre,
          pistaId,
          fecha,
          horaInicio,
          horaFin,
          ludoteca,
          precioTotal: total,
        }),
      });
      if (!response.ok) throw new Error('Error al guardar reserva');

      Alert.alert('Reserva confirmada', 'Tu reserva ha sido guardada correctamente');
      navigation.navigate('inicio');
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo guardar la reserva');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Resumen de la Reserva</Text>

      <Text style={styles.label}>Nombre: <Text style={styles.valor}>{nombre}</Text></Text>
      <Text style={styles.label}>DNI: <Text style={styles.valor}>{dni}</Text></Text>
      <Text style={styles.label}>Pista: <Text style={styles.valor}>{pistaNombre}</Text></Text>
      <Text style={styles.label}>Fecha: <Text style={styles.valor}>{fecha}</Text></Text>
      <Text style={styles.label}>Hora Inicio: <Text style={styles.valor}>{horaInicio}</Text></Text>
      <Text style={styles.label}>Hora Fin: <Text style={styles.valor}>{horaFin}</Text></Text>
      <Text style={styles.label}>Duración: <Text style={styles.valor}>{duracion} horas</Text></Text>
      <Text style={styles.label}>Ludoteca: <Text style={styles.valor}>{ludoteca ? 'Sí' : 'No'}</Text></Text>
      <Text style={styles.precio}>Precio total: {total.toFixed(2)} €</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#1976D2" />
      ) : (
        <TouchableOpacity style={styles.boton} onPress={handleConfirmar}>
          <Text style={styles.botonTexto}>Confirmar Reserva</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.boton, { backgroundColor: '#aaa', marginTop: 12 }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.botonTexto}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 24,
    maxWidth: 600,
    marginHorizontal: 'auto',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
    color: '#1976D2',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  valor: {
    fontWeight: '400',
    color: '#444',
  },
  precio: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '700',
    color: '#0B610B',
  },
  boton: {
    backgroundColor: '#1976D2',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  botonTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
