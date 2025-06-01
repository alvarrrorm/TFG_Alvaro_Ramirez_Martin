import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useUser } from '../contexto/UserContex';

export default function MisReservas() {
  const { usuario } = useUser();
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerReservas = async () => {
      if (!usuario || !usuario.dni) {
        console.warn('No hay usuario o DNI definido para cargar reservas.');
        setCargando(false);
        return;
      }
      
      setCargando(true);
      const url = `http://localhost:3001/reservas/dni/${usuario.dni}`;
      console.log('Solicitando reservas con URL:', url);

      try {
        const respuesta = await fetch(url);
        if (!respuesta.ok) {
          throw new Error(`Error en la respuesta: ${respuesta.status}`);
        }
        const data = await respuesta.json();
        setReservas(data);
      } catch (error) {
        console.error('Error al cargar las reservas:', error);
      } finally {
        setCargando(false);
      }
    };

    obtenerReservas();
  }, [usuario]);

  const renderReserva = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.fecha}>{item.fecha}</Text>
      <Text style={styles.texto}>Pista: {item.pista}</Text>
      <Text style={styles.texto}>Hora: {item.hora_inicio} - {item.hora_fin}</Text>
    </View>
  );

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (reservas.length === 0) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.texto}>No tienes reservas aún.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={reservas}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderReserva}
      contentContainerStyle={styles.lista}
    />
  );
}

const styles = StyleSheet.create({
  lista: {
    padding: 20,
  },
  card: {
    backgroundColor: '#E0E7FF',
    padding: 20,
    borderRadius: 14,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  texto: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 5,
  },
  fecha: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 10,
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
