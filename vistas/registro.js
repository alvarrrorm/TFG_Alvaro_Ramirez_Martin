import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Keyboard,
  Platform,
  FlatList,
  Linking
} from 'react-native';

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
      const response = await fetch('http://51.44.193.22:3001/registro', {
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
    <View style={styles.overlay}>
      <FlatList
        data={[]}
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={
          <View style={styles.container}>
            <View style={styles.formContainer}>
              <Text style={styles.title}>Crear cuenta</Text>
              <Text style={styles.subtitle}>Únete a nuestra comunidad deportiva</Text>

              {mensajeError ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{mensajeError}</Text>
                </View>
              ) : null}

              <TextInput
                placeholder="Nombre completo"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                value={nombre}
                onChangeText={(text) => { setNombre(text); setMensajeError(''); }}
                returnKeyType="next"
              />
              <TextInput
                placeholder="Correo electrónico"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                value={correo}
                onChangeText={(text) => { setCorreo(text); setMensajeError(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
              <TextInput
                placeholder="Nombre de usuario"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                value={usuario}
                onChangeText={(text) => { setUsuario(text); setMensajeError(''); }}
                autoCapitalize="none"
                returnKeyType="next"
              />
              <TextInput
                placeholder="DNI"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                value={dni}
                onChangeText={(text) => { setDni(text); setMensajeError(''); }}
                returnKeyType="next"
              />
              <TextInput
                placeholder="Contraseña"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                style={styles.input}
                value={pass}
                onChangeText={(text) => { setPass(text); setMensajeError(''); }}
                returnKeyType="next"
              />
              <TextInput
                placeholder="Repetir contraseña"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                style={styles.input}
                value={pass_2}
                onChangeText={(text) => { setPass2(text); setMensajeError(''); }}
                returnKeyType="next"
              />
              <TextInput
                placeholder="Clave de administrador (opcional)"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                style={styles.input}
                value={claveAdmin}
                onChangeText={(text) => { setClaveAdmin(text); setMensajeError(''); }}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />

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
                style={styles.button} 
                onPress={handleRegister}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Registrarse</Text>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>o</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.secondaryButtonText}>¿Ya tienes cuenta? Inicia sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        contentContainerStyle={styles.contentContainerStyle}
        style={Platform.OS === 'web' ? { height: '100vh' } : {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
    minHeight: Platform.OS === 'web' ? '100vh' : undefined,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center'
  },
  formContainer: {
  width: '100%',
  maxWidth: 1200,    
  backgroundColor: 'rgba(255,255,255,0.95)',
  borderRadius: 25,
  paddingVertical: 20,  
  paddingHorizontal: 50, 
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.2,
  shadowRadius: 20,
  elevation: 15,
},

input: {
  width: '100%',
  height: 50,          
  borderWidth: 1,
  borderColor: '#E5E7EB',
  borderRadius: 12,
  paddingHorizontal: 20,
  marginBottom: 12,    
  fontSize: 16,
  backgroundColor: 'rgba(249, 250, 251, 0.8)',
  color: '#1F2937',
},

button: {
  backgroundColor: '#4F46E5',
  paddingVertical: 16, 
  borderRadius: 12,
  marginTop: 10,
  width: '100%',
  alignItems: 'center',
  shadowColor: '#4F46E5',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 5,
},
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 55,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: 'rgba(249, 250, 251, 0.8)',
    color: '#1F2937',
  },
  button: {
    backgroundColor: '#4F46E5',
    paddingVertical: 18,
    borderRadius: 12,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
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
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
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
    color: '#4F46E5',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    color: '#6B7280',
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '700',
  },
  contentContainerStyle: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
});