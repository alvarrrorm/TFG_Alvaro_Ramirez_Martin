import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useUser } from '../contexto/UserContex';

export default function CrearReserva({ navigation }) {
  const { dni } = useUser();  // Obtenemos el dni del usuario autenticado
  const [idPolideportivo, setIdPolideportivo] = useState('');
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');

  const handleReserva = async () => {
    if (!idPolideportivo || !fecha || !horaInicio || !horaFin) {
      Alert.alert('Error', 'Por favor, completa todos los campos');
      return;
    }

    try {
      const response = await fetch('http://51.44.193.22:3001/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dni_usuario: dni,
          id_polideportivo: idPolideportivo,
          fecha,
          hora_inicio: horaInicio,
          hora_fin: horaFin
        })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Éxito', 'Reserva creada correctamente');
        navigation.goBack();
      } else {
        Alert.alert('Error', data.error || 'No se pudo crear la reserva');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo conectar con el servidor');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nueva Reserva</Text>

      <TextInput
        placeholder="ID Polideportivo"
        style={styles.input}
        keyboardType="numeric"
        value={idPolideportivo}
        onChangeText={setIdPolideportivo}
      />
      <TextInput
        placeholder="Fecha (YYYY-MM-DD)"
        style={styles.input}
        value={fecha}
        onChangeText={setFecha}
      />
      <TextInput
        placeholder="Hora inicio (HH:MM)"
        style={styles.input}
        value={horaInicio}
        onChangeText={setHoraInicio}
      />
      <TextInput
        placeholder="Hora fin (HH:MM)"
        style={styles.input}
        value={horaFin}
        onChangeText={setHoraFin}
      />

      <Button title="Reservar" onPress={handleReserva} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    padding: 20,
    justifyContent: 'center'
  },
  title: {
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1, 
    borderColor: '#ccc', 
    padding: 10, 
    borderRadius: 8, 
    marginBottom: 15
  }
});
