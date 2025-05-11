import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

export default function Login({ navigation }) {
  const [usuario, setUsuario] = useState('');
  const [pass, setPass] = useState('');
  const [mensajeError, setMensajeError] = useState('');

  const handleLogin = async () => {
    if (!usuario || !pass) {
      setMensajeError('Por favor, completa todos los campos');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, pass })
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar el usuario en AsyncStorage
        await AsyncStorage.setItem('usuario', JSON.stringify({ usuario }));

        setMensajeError('');
        Alert.alert('Bienvenido', 'Inicio de sesión exitoso');

        // Navegar a la pantalla de reservas
        navigation.navigate('Reservas');
      } else {
        // Mostrar error si la respuesta no es exitosa
        setMensajeError(data.error || 'Usuario o contraseña incorrectos');
      }
    } catch (error) {
      console.error(error);
      setMensajeError('No se pudo conectar con el servidor');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Iniciar sesión</Text>

        {mensajeError !== '' && <Text style={styles.errorText}>{mensajeError}</Text>}

        <TextInput
          placeholder="Nombre de usuario"
          style={styles.input}
          value={usuario}
          onChangeText={(text) => { setUsuario(text); setMensajeError(''); }}s
        />
        <TextInput
          placeholder="Contraseña"
          secureTextEntry
          style={styles.input}
          value={pass}
          onChangeText={(text) => { setPass(text); setMensajeError(''); }}
        />

        <TouchableOpacity style={[styles.button, styles.shadow]} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        <Text style={styles.registerText}>
          ¿No tienes cuenta?{' '}
          <Text onPress={() => navigation.navigate('Registro')} style={styles.link}>
            Regístrate aquí
          </Text>
        </Text>
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
    justifyContent: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  registerText: {
    marginTop: 20,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  link: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
});
