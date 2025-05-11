import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useUser } from '../contexto/UserContex';

export default function Reservas({ navigation }) {
  const { usuario } = useUser();

  return (
    <SafeAreaView style={styles.container}>
   
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Área de reservas</Text>

        {usuario && (
          <Text style={styles.username}>Hola, {usuario} 👋</Text>
        )}

        <Text style={styles.subtitle}>
          Aquí podrás reservar pistas deportivas o apuntarte a la ludoteca del polideportivo. ¡Nos alegra tenerte aquí!
        </Text>

        
        <TouchableOpacity style={styles.reserveButton} onPress={() => navigation.navigate('NuevaReserva')}>
          <Text style={styles.reserveButtonText}>Hacer nueva reserva</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    alignItems: 'flex-end',
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 10,
  },
  username: {
    fontSize: 22,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 40,
  },
  reserveButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    elevation: 3,
  },
  reserveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
