import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useUser } from '../contexto/UserContex';

export default function Inicio({ navigation }) {
  const { usuario } = useUser(); 

  const handleReserva = () => {
    if (usuario) {
      // Si el usuario está autenticado, navegar a Reservas
      navigation.navigate('Reservas');
    } else {
      // Si no, redirigir a Login
      navigation.navigate('Login');
    }
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.title}>Bienvenido a <Text style={styles.titleHighlight}>Depo</Text></Text>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.button, styles.shadow]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.shadow]}
            onPress={() => navigation.navigate('Registro')}
          >
            <Text style={styles.buttonText}>Registrarse</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.contentTitle}>¿Qué es Depo?</Text>
        <Text style={styles.contentText}>
          Depo es tu plataforma para descubrir, organizar y disfrutar actividades deportivas. 
          Conecta con otros deportistas, reserva instalaciones y participa en eventos exclusivos. 
          ¡Únete a la comunidad Depo!
        </Text>
        <TouchableOpacity
          style={[styles.button, styles.shadow]}
          onPress={handleReserva} // Llamar la función para manejar la reserva
        >
          <Text style={styles.buttonText}>Reserva</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 60,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  header: {
    width: '100%',
    maxWidth: 1000,
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  titleHighlight: {
    color: '#3B82F6', // Azul bonito
  },
  buttonGroup: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 20,
    justifyContent: 'center',  // Elimina flexWrap ya que solo hay dos botones
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 10,
    minWidth: 180,
    alignItems: 'center',
    elevation: 5,  // Para sombra en dispositivos Android
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    maxWidth: 1000,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  contentTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
  },
  contentText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#4B5563',
    textAlign: 'center',
  },
});
