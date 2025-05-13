import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';

export default function Register({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [usuario, setUsuario] = useState('');
  const [dni, setDni] = useState('');
  const [pass, setPass] = useState('');
  const [pass_2, setPass2] = useState('');
  const [claveAdmin, setClaveAdmin] = useState('');
  const [mensajeError, setMensajeError] = useState('');

  const handleRegister = async () => {
    if (!nombre || !correo || !usuario || !dni || !pass || !pass_2) {
      setMensajeError('Por favor, completa todos los campos');
      return;
    }

    if (pass !== pass_2) {
      setMensajeError('Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo, usuario, dni, pass, pass_2, clave_admin: claveAdmin })
      });

      const data = await response.json();

      if (response.ok) {
        setMensajeError('');
        Alert.alert('Éxito', 'Usuario registrado con éxito');
        navigation.navigate('Login');
      } else {
        setMensajeError(data.error || 'No se pudo registrar el usuario');
      }
    } catch (error) {
      console.error(error);
      setMensajeError('No se pudo conectar con el servidor');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Crear cuenta</Text>

        {mensajeError !== '' && <Text style={styles.errorText}>{mensajeError}</Text>}

        <TextInput
          placeholder="Nombre completo"
          style={styles.input}
          value={nombre}
          onChangeText={(text) => { setNombre(text); setMensajeError(''); }}
        />
        <TextInput
          placeholder="Correo electrónico"
          style={styles.input}
          value={correo}
          onChangeText={(text) => { setCorreo(text); setMensajeError(''); }}
        />
        <TextInput
          placeholder="Nombre de usuario"
          style={styles.input}
          value={usuario}
          onChangeText={(text) => { setUsuario(text); setMensajeError(''); }}
        />
        <TextInput
          placeholder="DNI"
          style={styles.input}
          value={dni}
          onChangeText={(text) => { setDni(text); setMensajeError(''); }}
        />
        <TextInput
          placeholder="Contraseña"
          secureTextEntry
          style={styles.input}
          value={pass}
          onChangeText={(text) => { setPass(text); setMensajeError(''); }}
        />
        <TextInput
          placeholder="Repetir contraseña"
          secureTextEntry
          style={styles.input}
          value={pass_2}
          onChangeText={(text) => { setPass2(text); setMensajeError(''); }}
        />
        <TextInput
          placeholder="Clave de administrador (opcional)"
          style={styles.input}
          value={claveAdmin}
          onChangeText={(text) => { setClaveAdmin(text); setMensajeError(''); }}
        />

        <TouchableOpacity style={[styles.button, styles.shadow]} onPress={handleRegister}>
          <Text style={styles.buttonText}>Registrarse</Text>
        </TouchableOpacity>

        <Text style={styles.registerText}>
          ¿Ya tienes cuenta?{' '}
          <Text onPress={() => navigation.navigate('Login')} style={styles.link}>
            Inicia sesión aquí
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
