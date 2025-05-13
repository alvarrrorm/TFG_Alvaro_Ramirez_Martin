import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, FlatList } from 'react-native';
import { useUser } from '../contexto/UserContex';

export default function AdminPanel({ navigation }) {
  const { usuarios, logout } = useUser();
  const [pistas, setPistas] = useState([]);  // Estado para almacenar las pistas
  const [reservas, setReservas] = useState([]);  // Estado para almacenar las reservas

  // Simula obtener las pistas y las reservas de la base de datos (puedes cambiar esto por llamadas a una API)
  useEffect(() => {
    // Aquí puedes agregar la lógica para obtener los datos de pistas y reservas
    setPistas([
      { id: 1, nombre: 'Pista 1', enMantenimiento: false },
      { id: 2, nombre: 'Pista 2', enMantenimiento: false },
    ]);

    setReservas([
      { id: 1, usuario: 'Juan Pérez', pista: 'Pista 1', fecha: '2025-05-12 10:00' },
      { id: 2, usuario: 'Ana López', pista: 'Pista 2', fecha: '2025-05-13 14:00' },
    ]);
  }, []);

  // Función para marcar una pista como en mantenimiento
  const marcarMantenimiento = (id) => {
    const updatedPistas = pistas.map(pista =>
      pista.id === id ? { ...pista, enMantenimiento: true } : pista
    );
    setPistas(updatedPistas);
  };

  // Función para eliminar una pista (simulación)
  const eliminarPista = (id) => {
    Alert.alert(
      'Eliminar pista',
      '¿Estás seguro de que deseas eliminar esta pista?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', onPress: () => {
          const updatedPistas = pistas.filter(pista => pista.id !== id);
          setPistas(updatedPistas);
        }},
      ]
    );
  };

  // Función para ver detalles de una reserva
  const verDetallesReserva = (reserva) => {
    Alert.alert(
      'Detalles de reserva',
      `Usuario: ${reserva.usuario}\nPista: ${reserva.pista}\nFecha: ${reserva.fecha}`,
      [{ text: 'Cerrar' }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel de Administración</Text>

      {/* Mostrar nombre del administrador */}
      <Text style={styles.username}>Hola, {usuarios.nombre} 👋</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pistas</Text>

        {/* Lista de pistas */}
        <FlatList
          data={pistas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.itemText}>{item.nombre} {item.enMantenimiento && '(En mantenimiento)'}</Text>
              <TouchableOpacity onPress={() => marcarMantenimiento(item.id)} style={styles.button}>
                <Text style={styles.buttonText}>Marcar mantenimiento</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => eliminarPista(item.id)} style={styles.button}>
                <Text style={styles.buttonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reservas</Text>

        {/* Lista de reservas */}
        <FlatList
          data={reservas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.itemText}>{item.usuario} - {item.pista} ({item.fecha})</Text>
              <TouchableOpacity onPress={() => verDetallesReserva(item)} style={styles.button}>
                <Text style={styles.buttonText}>Ver detalles</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>

      <TouchableOpacity onPress={() => logout()} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  username: {
    fontSize: 22,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 10,
  },
  item: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 5,
  },
  itemText: {
    fontSize: 16,
    color: '#333333',
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 30,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
});
