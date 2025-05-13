import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useUser } from '../contexto/UserContex';

export default function Reservas({ navigation }) {
  const { usuario, rol, logout } = useUser();

  console.log("Datos del contexto - Usuario:", usuario, "Rol:", rol); // Para depuración

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Área de reservas</Text>
        <Text style={styles.username}>Hola, {usuario || 'invitado'} 👋</Text>
        <Text style={styles.userRole}>Rol: {rol || ''}</Text>
        
        {rol === 'admin' && (
          <TouchableOpacity
            style={[styles.button, styles.adminButton]}
            onPress={() => navigation.navigate('AdminPanel')}
          >
            <Text style={styles.buttonText}>Ir a administración</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.reserveButton]}
          onPress={() => navigation.navigate('NuevaReserva')}
        >
          <Text style={styles.buttonText}>Hacer nueva reserva</Text>
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
    marginBottom: 10,
  },
  userRole: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  reserveButton: {
    backgroundColor: '#3B82F6',
    elevation: 3,
  },
  adminButton: {
    backgroundColor: '#10B981',
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});