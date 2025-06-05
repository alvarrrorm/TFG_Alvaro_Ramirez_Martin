import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserContext } from '../contexto/UserContex';

const MisReservas = () => {
  const { user } = useContext(UserContext);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchReservas = async () => {
    setLoading(true);
    try {
      if (!user?.dni) {
        setReservas([]);
        setLoading(false);
        return;
      }
      const response = await fetch(`http://192.168.0.19:3001/reservas?dni_usuario=${user.dni}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Reservas recibidas:', data);
      // Ordenar reservas (puedes hacerlo también en backend)
      const reservasOrdenadas = data.sort((a, b) => {
        const dateA = new Date(`${a.fecha}T${a.hora_inicio}`);
        const dateB = new Date(`${b.fecha}T${b.hora_inicio}`);
        return dateA - dateB;
      });
      setReservas(reservasOrdenadas);
    } catch (error) {
      console.error('Error al cargar reservas:', error);
      setReservas([]);
    } finally {
      setLoading(false);
    }
  };

  fetchReservas();
}, [user]);


  const renderItem = ({ item }) => (
    <View style={styles.reservaItem}>
      <Ionicons name="calendar" size={24} color="#4B5563" style={styles.icon} />
      <View>
        <Text style={styles.reservaTexto}>
          {item.fecha} de {item.hora_inicio} a {item.hora_fin}
        </Text>
        <Text style={styles.reservaSubtexto}>
          Pista: {item.nombre_pista || `#${item.pista}`}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={{ marginTop: 10 }}>Cargando tus reservas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Mis Reservas</Text>
      {reservas.length === 0 ? (
        <Text style={styles.noReservas}>No tienes reservas activas.</Text>
      ) : (
        <FlatList
          data={reservas}
keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.lista}
        />
      )}
    </View>
  );
};

export default MisReservas;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#111827',
  },
  reservaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  icon: {
    marginRight: 15,
  },
  reservaTexto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  reservaSubtexto: {
    fontSize: 14,
    color: '#6B7280',
  },
  noReservas: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  lista: {
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
