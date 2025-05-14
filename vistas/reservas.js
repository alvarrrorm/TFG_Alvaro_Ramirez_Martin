import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  StatusBar
} from 'react-native';
import { useUser } from '../contexto/UserContex';

export default function Reservas({ navigation }) {
  const { usuario, rol, logout } = useUser();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header fijo */}
      <View style={styles.header}>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Contenido con scroll */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Área de reservas</Text>
          <Text style={styles.username}>Hola, {usuario || 'invitado'} 👋</Text>
          
          {rol === 'admin' && (
            <TouchableOpacity
              style={[styles.button, styles.adminButton]}
              onPress={() => navigation.navigate('AdminPanel')}
            >
              <Text style={styles.buttonText}>Panel de Administración</Text>
              <Text style={styles.buttonSubtext}>Gestionar pistas y reservas</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.reserveButton]}
            onPress={() => navigation.navigate('NuevaReserva')}
          >
            <Text style={styles.buttonText}>Nueva Reserva</Text>
            <Text style={styles.buttonSubtext}>Reservar una pista ahora</Text>
          </TouchableOpacity>

          {/* Sección adicional para hacer scroll */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Cómo reservar</Text>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>Selecciona "Nueva Reserva"</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>Elige fecha y hora</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>Selecciona la pista disponible</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>4</Text>
              <Text style={styles.stepText}>Confirma tu reserva</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 15,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    zIndex: 10,
  },
  logoutButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 16,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  content: {
    paddingHorizontal: 25,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  username: {
    fontSize: 22,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 18,
    paddingHorizontal: 25,
    borderRadius: 14,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  reserveButton: {
    backgroundColor: '#3B82F6',
  },
  adminButton: {
    backgroundColor: '#10B981',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  buttonSubtext: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  infoSection: {
    marginTop: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E5E7EB',
    color: '#3B82F6',
    fontWeight: '700',
    textAlign: 'center',
    textAlignVertical: 'center',
    marginRight: 15,
  },
  stepText: {
    fontSize: 16,
    color: '#4B5563',
    flex: 1,
  },
});