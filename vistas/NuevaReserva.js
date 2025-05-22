import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useUser } from '../contexto/UserContex';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function CrearReserva({ navigation }) {
  const { dni } = useUser();
  const [idPolideportivo, setIdPolideportivo] = useState('');
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimeStartPicker, setShowTimeStartPicker] = useState(false);
  const [showTimeEndPicker, setShowTimeEndPicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setFecha(formattedDate);
    }
  };

  const handleTimeStartChange = (event, selectedTime) => {
    setShowTimeStartPicker(false);
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      setHoraInicio(`${hours}:${minutes}`);
    }
  };

  const handleTimeEndChange = (event, selectedTime) => {
    setShowTimeEndPicker(false);
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      setHoraFin(`${hours}:${minutes}`);
    }
  };

  const handleReserva = async () => {
    if (!idPolideportivo || !fecha || !horaInicio || !horaFin) {
      Alert.alert('Error', 'Por favor, completa todos los campos');
      return;
    }

    try {
      const response = await fetch('https://51.44.193.22:3001/reservas', {
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
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Nueva Reserva</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Polideportivo</Text>
          <View style={styles.inputWrapper}>
            <Icon name="sports" size={20} color="#555" style={styles.icon} />
            <TextInput
              placeholder="Ingresa el ID del polideportivo"
              style={styles.input}
              keyboardType="numeric"
              value={idPolideportivo}
              onChangeText={setIdPolideportivo}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Fecha</Text>
          <TouchableOpacity 
            style={styles.dateInput} 
            onPress={() => setShowDatePicker(true)}
          >
            <Icon name="calendar-today" size={20} color="#555" style={styles.icon} />
            <Text style={fecha ? styles.dateText : styles.placeholderText}>
              {fecha || 'Selecciona una fecha (YYYY-MM-DD)'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>

        <View style={styles.timeContainer}>
          <View style={styles.timeInputContainer}>
            <Text style={styles.label}>Hora inicio</Text>
            <TouchableOpacity 
              style={styles.dateInput} 
              onPress={() => setShowTimeStartPicker(true)}
            >
              <Icon name="access-time" size={20} color="#555" style={styles.icon} />
              <Text style={horaInicio ? styles.dateText : styles.placeholderText}>
                {horaInicio || 'Selecciona hora inicio'}
              </Text>
            </TouchableOpacity>
            {showTimeStartPicker && (
              <DateTimePicker
                value={new Date()}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={handleTimeStartChange}
              />
            )}
          </View>

          <View style={styles.timeInputContainer}>
            <Text style={styles.label}>Hora fin</Text>
            <TouchableOpacity 
              style={styles.dateInput} 
              onPress={() => setShowTimeEndPicker(true)}
            >
              <Icon name="access-time" size={20} color="#555" style={styles.icon} />
              <Text style={horaFin ? styles.dateText : styles.placeholderText}>
                {horaFin || 'Selecciona hora fin'}
              </Text>
            </TouchableOpacity>
            {showTimeEndPicker && (
              <DateTimePicker
                value={new Date()}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={handleTimeEndChange}
              />
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleReserva}>
          <Text style={styles.buttonText}>Confirmar Reserva</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  container: {
    flex: 1,
    padding: 25,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#2c3e50',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#34495e',
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    height: 50,
    paddingLeft: 10,
    fontSize: 16,
    color: '#2c3e50',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 10,
  },
  placeholderText: {
    flex: 1,
    fontSize: 16,
    color: '#95a5a6',
    marginLeft: 10,
  },
  icon: {
    marginRight: 10,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeInputContainer: {
    width: '48%',
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
    shadowColor: '#2980b9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});