import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Keyboard,
  ScrollView
} from 'react-native';
import { Linking } from 'react-native';



export default function Register({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [usuario, setUsuario] = useState('');
  const [dni, setDni] = useState('');
  const [pass, setPass] = useState('');
  const [pass_2, setPass2] = useState('');
  const [claveAdmin, setClaveAdmin] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [aceptoPoliticas, setAceptoPoliticas] = useState(false);

  const handleRegister = async () => {
    Keyboard.dismiss();

    if (!nombre || !correo || !usuario || !dni || !pass || !pass_2) {
      setMensajeError('Por favor, completa todos los campos');
      return;
    }

    if (pass !== pass_2) {
      setMensajeError('Las contraseñas no coinciden');
      return;
    }

    if (!aceptoPoliticas) {
      setMensajeError('Debes aceptar las políticas de privacidad');
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

const navigateToPoliticas = () => {
  Linking.openURL('https://drive.google.com/file/d/1wJ_KyccZQE6VPjGLy8ThGCvXFj2OrhoC/view?usp=sharing');
};

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Crear cuenta</Text>

          {mensajeError !== '' && <Text style={styles.errorText}>{mensajeError}</Text>}

          <TextInput
            placeholder="Nombre completo"
            style={styles.input}
            value={nombre}
            onChangeText={(text) => { setNombre(text); setMensajeError(''); }}
            returnKeyType="next"
          />
          <TextInput
            placeholder="Correo electrónico"
            style={styles.input}
            value={correo}
            onChangeText={(text) => { setCorreo(text); setMensajeError(''); }}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
          />
          <TextInput
            placeholder="Nombre de usuario"
            style={styles.input}
            value={usuario}
            onChangeText={(text) => { setUsuario(text); setMensajeError(''); }}
            autoCapitalize="none"
            returnKeyType="next"
          />
          <TextInput
            placeholder="DNI"
            style={styles.input}
            value={dni}
            onChangeText={(text) => { setDni(text); setMensajeError(''); }}
            returnKeyType="next"
          />
          <TextInput
            placeholder="Contraseña"
            secureTextEntry
            style={styles.input}
            value={pass}
            onChangeText={(text) => { setPass(text); setMensajeError(''); }}
            returnKeyType="next"
          />
          <TextInput
            placeholder="Repetir contraseña"
            secureTextEntry
            style={styles.input}
            value={pass_2}
            onChangeText={(text) => { setPass2(text); setMensajeError(''); }}
            returnKeyType="next"
          />
          <TextInput
            placeholder="Clave de administrador (opcional)"
            secureTextEntry
            style={styles.input}
            value={claveAdmin}
            onChangeText={(text) => { setClaveAdmin(text); setMensajeError(''); }}
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
          />

          {/* Checkbox para políticas de privacidad */}
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setAceptoPoliticas(!aceptoPoliticas)}
            >
              <View style={[styles.checkboxIcon, aceptoPoliticas && styles.checkboxChecked]}>
                {aceptoPoliticas && <Text style={styles.checkboxCheckmark}>✓</Text>}
              </View>
             <Text style={styles.checkboxText}>
  Acepto las{' '}
  <Text style={styles.politicasLink} onPress={navigateToPoliticas}>
    políticas de privacidad
  </Text>
</Text>


            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.shadow]}
            onPress={handleRegister}
          >
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 25,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 15,
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
    marginBottom: 15,
    textAlign: 'center',
    width: '100%',
  },
  checkboxContainer: {
    width: '100%',
    marginBottom: 20,
    marginTop: 10,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxIcon: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 5,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  checkboxCheckmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxText: {
    fontSize: 15,
    color: '#4B5563',
  },
  politicasLink: {
    color: '#3B82F6',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});