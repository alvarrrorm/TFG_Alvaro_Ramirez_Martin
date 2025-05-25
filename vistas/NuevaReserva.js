import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions,
    useWindowDimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { UserContext } from '../contexto/UserContex';
const windowWidth = Dimensions.get('window').width;

const isWeb = Platform.OS === 'web';
let DatePickerWeb;
if (isWeb) {
  DatePickerWeb = require('react-datepicker').default;
  require('react-datepicker/dist/react-datepicker.css');
}

export default function CrearReserva({ navigation }) {
  const { width: windowWidth } = useWindowDimensions();
  const { user } = useContext(UserContext);
  const { dni, nombre } = user || { dni: '', nombre: '' };

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [form, setForm] = useState({
    pista: '',
    fecha: '',
    horaInicio: '08:00',
    horaFin: '09:00',
    nombreUsuario: nombre
  });
  const [pistas, setPistas] = useState([]);
  const [loading, setLoading] = useState(false);

  const horasDisponibles = Array.from({ length: 15 }, (_, i) => {
    const hora = 8 + i;
    return `${hora.toString().padStart(2, '0')}:00`;
  });

  useEffect(() => {
    const cargarPistas = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:3001/pistas');
        const data = await response.json();
        setPistas(data.filter(p => p.disponible === 1));
      } catch (error) {
        Alert.alert("Error", "No se pudieron cargar las pistas");
        console.error("Error al cargar pistas:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarPistas();
  }, []);

  const handleSubmit = async () => {
    if (!form.pista || !form.fecha) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      const pistaSeleccionada = pistas.find(p => p.nombre === form.pista);
      if (!pistaSeleccionada) throw new Error("La pista seleccionada no es válida");

      const reservaData = {
        dni_usuario: dni,
        nombre_usuario: nombre,
        id_pista: pistaSeleccionada.id,
        pista: form.pista,
        fecha: form.fecha,
        hora_inicio: form.horaInicio,
        hora_fin: form.horaFin,
        estado: 'pendiente'
      };

      const response = await fetch('http://localhost:3001/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservaData)
      });

      if (response.ok) {
        Alert.alert("Éxito", "Reserva creada correctamente");
        navigation.goBack();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear reserva");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { width: windowWidth > 600 ? 600 : '100%', alignSelf: 'center' }]}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Nueva Reserva</Text>
        <Text style={styles.subtitulo}>Completa los campos para reservar</Text>
      </View>

      <View style={styles.formularioContainer}>
        <Text style={styles.seccionTitulo}>Información de la Reserva</Text>

        <TextInput
          style={[styles.input, { backgroundColor: '#ECEFF1' }]}
          value={nombre}
          editable={false}
          placeholder="Nombre del usuario"
        />

        {/* Selector de pista */}
        <View style={styles.dropdown}>
          <Picker
            selectedValue={form.pista}
            onValueChange={(value) => setForm({ ...form, pista: value })}
          >
            <Picker.Item label="Selecciona una pista" value="" />
            {pistas.map(pista => (
              <Picker.Item key={pista.id} label={`${pista.nombre} (${pista.tipo || 'Sin tipo'})`} value={pista.nombre} />
            ))}
          </Picker>
        </View>

        {/* Fecha */}
        {isWeb ? (
          <DatePickerWeb
            selected={form.fecha ? new Date(form.fecha) : null}
            onChange={(date) => {
              if (date) {
                const fechaFormateada = date.toISOString().split('T')[0];
                setForm({ ...form, fecha: fechaFormateada });
              }
            }}
            dateFormat="yyyy-MM-dd"
            placeholderText="Selecciona una fecha"
            className="custom-date-picker"
          />
        ) : (
          <>
            <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
              <Text style={{ fontSize: 16, color: form.fecha ? '#000' : '#888' }}>
                {form.fecha || 'Selecciona una fecha'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
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

        {/* Horas */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={[styles.dropdown, { flex: 1, marginRight: 8 }]}>
            <Picker
              selectedValue={form.horaInicio}
              onValueChange={(value) => setForm({ ...form, horaInicio: value })}
            >
              {horasDisponibles.map(hora => (
                <Picker.Item key={hora} label={hora} value={hora} />
              ))}
            </Picker>
          </View>

          <View style={[styles.dropdown, { flex: 1 }]}>
            <Picker
              selectedValue={form.horaFin}
              onValueChange={(value) => setForm({ ...form, horaFin: value })}
            >
              {horasDisponibles.filter(h => h > form.horaInicio).map(hora => (
                <Picker.Item key={hora} label={hora} value={hora} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Botón */}
        <TouchableOpacity
          style={[styles.botonAgregar, (!form.pista || !form.fecha || loading) && styles.botonDisabled]}
          onPress={handleSubmit}
          disabled={!form.pista || !form.fecha || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botonAgregarTexto}>Reservar</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2F7',
  },
  scrollContainer: {
    padding: 24,
    paddingBottom: 32,
    width: windowWidth > 600 ? 600 : '100%',
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 28,
    alignItems: 'center',
  },
  titulo: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1A73E8', // azul vibrante
    textShadowColor: 'rgba(26, 115, 232, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitulo: {
    fontSize: 18,
    color: '#5F6C7B',
    marginTop: 6,
    fontWeight: '600',
  },
  formularioContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 26,
    marginBottom: 28,
    ...Platform.select({
      ios: {
        shadowColor: '#1A73E8',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0 8px 16px rgba(26, 115, 232, 0.2)',
      },
    }),
    width: '100%',
  },
  seccionTitulo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#34495E',
    marginBottom: 18,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#D0D7DE',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 14,
    fontSize: 17,
    backgroundColor: '#FAFBFC',
    color: '#2F4050',
    width: '100%',
    fontWeight: '600',
  },
  errorTexto: {
    color: '#E84235',
    fontWeight: '700',
    marginBottom: 14,
    fontSize: 14,
  },
  dropdown: {
    borderColor: '#D0D7DE',
    marginBottom: 18,
    borderRadius: 14,
    width: '100%',
    backgroundColor: '#FAFBFC',
  },
  dropdownContainer: {
    borderColor: '#D0D7DE',
    borderRadius: 14,
  },
  botonAgregar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A73E8',
    borderRadius: 14,
    paddingVertical: 16,
    width: '100%',
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  botonDisabled: {
    backgroundColor: '#A8C1F5',
    shadowOpacity: 0,
  },
  botonAgregarTexto: {
    color: 'white',
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: 0.8,
  },
  listaContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 26,
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 10,
    width: '100%',
  },
  listaVacia: {
    textAlign: 'center',
    color: '#7F8C8D',
    marginVertical: 22,
    fontSize: 16,
    fontStyle: 'italic',
  },
  pistaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E4E9F2',
    width: '100%',
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  pistaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pistaNombre: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A73E8',
  },
  estadoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  estadoIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#4CAF50', // verde para disponible, se puede cambiar dinámicamente
  },
  estadoTexto: {
    fontSize: 16,
    color: '#5F6C7B',
  },
  pistaTipo: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 18,
  },
  accionesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  botonAccion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#E6F0FF',
    marginLeft: 14,
  },
  botonEliminar: {
    backgroundColor: '#FDECEA',
  },
  textoAccion: {
    marginLeft: 8,
    fontWeight: '700',
    fontSize: 15,
    color: '#1A73E8',
  },
  textoEliminar: {
    color: '#E84235',
  },
});

