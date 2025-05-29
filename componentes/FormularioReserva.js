import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerNative from '@react-native-community/datetimepicker';
import { Checkbox } from 'react-native-paper'; // Añadimos el Checkbox

import PistaSelector from './PistaSelector';
import CalendarioWeb from './CalendarioWeb'; 
import { UserContext } from '../contexto/UserContex';

export default function FormularioReserva({ navigation }) {
  const { usuario, dni } = useContext(UserContext);
  const nombre = usuario || '';

  const [form, setForm] = useState({
    pista: '',
    fecha: '',
    horaInicio: '08:00',
    horaFin: '09:00',
    ludoteca: false, // Nuevo campo para la ludoteca
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const horasDisponibles = Array.from({ length: 15 }, (_, i) => {
    const hora = 8 + i;
    return `${hora.toString().padStart(2, '0')}:00`;
  });

  const formatoFechaLegible = (fechaISO) => {
    if (!fechaISO) return '';
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fechaISO).toLocaleDateString('es-ES', opciones);
  };

  const handleSubmit = async () => {
    if (!form.pista || !form.fecha) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (form.horaFin <= form.horaInicio) {
      Alert.alert('Error', 'La hora de fin debe ser mayor que la de inicio');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('http://localhost:3001/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dni_usuario: dni,
          nombre_usuario: nombre,
          pista: form.pista,
          fecha: form.fecha,
          hora_inicio: form.horaInicio,
          hora_fin: form.horaFin,
          ludoteca: form.ludoteca, // Incluimos el campo ludoteca
          estado: 'pendiente',
        }),
      });

      if (!response.ok) throw new Error('Error al crear la reserva');

      Alert.alert('Éxito', 'Reserva creada correctamente');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nombre</Text>
      <View style={styles.userContainer}>
        <Text style={styles.userText}>{nombre || 'No identificado'}</Text>
      </View>

      <Text style={styles.label}>Selecciona la pista</Text>
      <PistaSelector
        value={form.pista}
        onChange={(value) => setForm({ ...form, pista: value })}
      />

      <Text style={styles.label}>Fecha de la reserva</Text>

      {Platform.OS === 'web' ? (
        <View style={{ marginBottom: 20, position: 'relative', zIndex: 10 }}>
          <CalendarioWeb
            selectedDate={form.fecha}
            onChangeDate={(fechaISO) => setForm({ ...form, fecha: fechaISO })}
          />
        </View>
      ) : (
        <>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.datePickerText, !form.fecha && { color: '#888' }]}>
              {form.fecha ? formatoFechaLegible(form.fecha) : 'Selecciona una fecha'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePickerNative
              value={form.fecha ? new Date(form.fecha) : new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  const fechaFormateada = selectedDate.toISOString().split('T')[0];
                  setForm({ ...form, fecha: fechaFormateada });
                }
              }}
            />
          )}
        </>
      )}

      <View style={styles.pickerRow}>
        <View style={styles.pickerWrapper}>
          <Text style={styles.pickerLabel}>Desde</Text>
          <Picker
            selectedValue={form.horaInicio}
            onValueChange={(value) => setForm({ ...form, horaInicio: value })}
            style={styles.picker}
            dropdownIconColor="#1976D2"
          >
            {horasDisponibles.map((hora) => (
              <Picker.Item key={hora} label={hora} value={hora} />
            ))}
          </Picker>
        </View>
        <View style={styles.pickerWrapper}>
          <Text style={styles.pickerLabel}>Hasta</Text>
          <Picker
            selectedValue={form.horaFin}
            onValueChange={(value) => setForm({ ...form, horaFin: value })}
            style={styles.picker}
            dropdownIconColor="#1976D2"
          >
            {horasDisponibles.filter((h) => h > form.horaInicio).map((hora) => (
              <Picker.Item key={hora} label={hora} value={hora} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Checkbox para la ludoteca */}
      <View style={styles.checkboxContainer}>
        <Checkbox
          status={form.ludoteca ? 'checked' : 'unchecked'}
          onPress={() => setForm({ ...form, ludoteca: !form.ludoteca })}
          color="#1976D2"
        />
        <Text style={styles.checkboxLabel}>Incluir servicio de ludoteca</Text>
      </View>

      <TouchableOpacity
        style={[styles.boton, loading && styles.botonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.botonTexto}>Reservar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fdfdfd',
    borderRadius: 16,
    maxWidth: 600,
    width: '100%',
    marginHorizontal: 'auto',
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#1976D2',
  },
  userContainer: {
    backgroundColor: '#eee',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  userText: {
    color: '#444',
    fontSize: 16,
    fontWeight: '500',
  },
  datePickerButton: {
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#00000022',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  datePickerText: {
    fontSize: 16,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pickerWrapper: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
    shadowColor: '#00000022',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  picker: {
    height: 44,
    color: '#333',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#444',
  },
  boton: {
    backgroundColor: '#1976D2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#1976D2cc',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  botonDisabled: {
    backgroundColor: '#7ea6d6',
  },
  botonTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});