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
  ScrollView,
  KeyboardAvoidingView,
  Linking,
  Dimensions,
} from 'react-native';

const screenHeight = Dimensions.get('window').height;

export default function Register({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [usuario, setUsuario] = useState('');
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');
  const [pass, setPass] = useState('');
  const [pass_2, setPass2] = useState('');
  const [claveAdmin, setClaveAdmin] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [aceptoPoliticas, setAceptoPoliticas] = useState(false);

  const handleRegister = () => {
    Keyboard.dismiss();

    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nombre || !correo || !usuario || !dni || !telefono || !pass || !pass_2) {
      setMensajeError('Por favor, completa todos los campos');
      return;
    }

    if (!correoValido.test(correo)) {
      setMensajeError('Correo electrónico no válido');
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

    fetch('https://tfgalvaroramirezmartin-production.up.railway.app/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre,
        correo,
        usuario,
        dni,
        telefono,
        pass,
        pass_2,
        clave_admin: claveAdmin,
      }),
    })
      .then(res => res.text())
      .then(text => {
        try {
          const data = JSON.parse(text);
          if (data.error) {
            setMensajeError(data.error);
          } else {
            setMensajeError('');
            Alert.alert('Éxito', 'Usuario registrado con éxito');
            navigation.navigate('Login');
          }
        } catch {
          setMensajeError('Respuesta inesperada del servidor');
        }
      })
      .catch(error => {
        console.error(error);
        setMensajeError('No se pudo conectar con el servidor');
      });
  };

  const navigateToPoliticas = () => {
    Linking.openURL(
      'https://drive.google.com/file/d/1wJ_KyccZQE6VPjGLy8ThGCvXFj2OrhoC/view?usp=sharing'
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.overlay}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.contentContainerStyle}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={Platform.OS === 'web' ? { maxHeight: screenHeight } : {}}
      >
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
              onChangeText={text => {
                setNombre(text);
                setMensajeError('');
              }}
              returnKeyType="next"
            />
            <TextInput
              placeholder="Correo electrónico"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={correo}
              onChangeText={text => {
                setCorreo(text);
                const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (text === '' || regex.test(text)) {
                  setMensajeError('');
                } else {
                  setMensajeError('Correo electrónico no válido');
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
            />
            <TextInput
              placeholder="Nombre de usuario"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={usuario}
              onChangeText={text => {
                setUsuario(text);
                setMensajeError('');
              }}
              autoCapitalize="none"
              returnKeyType="next"
            />
            <TextInput
              placeholder="DNI (Con Letra)"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={dni}
              onChangeText={text => {
                setDni(text.toUpperCase());
                setMensajeError('');
              }}
              autoCapitalize="characters"
              returnKeyType="next"
            />
            <TextInput
              placeholder="Número de Teléfono"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={telefono}
              onChangeText={text => {
                const soloNumeros = text.replace(/[^0-9]/g, '');
                setTelefono(soloNumeros);
                setMensajeError('');
              }}
              keyboardType="numeric"
              maxLength={15}
              returnKeyType="next"
            />
            <TextInput
              placeholder="Contraseña"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              style={styles.input}
              value={pass}
              onChangeText={text => {
                setPass(text);
                setMensajeError('');
              }}
              returnKeyType="next"
            />
            <TextInput
              placeholder="Repetir contraseña"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              style={styles.input}
              value={pass_2}
              onChangeText={text => {
                setPass2(text);
                setMensajeError('');
              }}
              returnKeyType="next"
            />
            <TextInput
              placeholder="Clave de administrador (opcional)"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              style={styles.input}
              value={claveAdmin}
              onChangeText={text => {
                setClaveAdmin(text);
                setMensajeError('');
              }}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />

            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setAceptoPoliticas(!aceptoPoliticas)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkboxIcon,
                    aceptoPoliticas && styles.checkboxChecked,
                  ]}
                >
                  {aceptoPoliticas && (
                    <Text style={styles.checkboxCheckmark}>✓</Text>
                  )}
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
              <Text style={styles.secondaryButtonText}>
                ¿Ya tienes cuenta? Inicia sesión
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    justifyContent: 'center',
  },
  container: {
    width: '100%',
    alignItems: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 600 : '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 32 : 26,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: Platform.OS === 'web' ? 16 : 14,
    color: '#64748B',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: Platform.OS === 'web' ? 16 : 14,
    borderColor: '#CBD5E1',
    borderWidth: 1,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#b91c1c',
    fontWeight: '600',
    fontSize: 14,
  },
  checkboxContainer: {
    marginBottom: 18,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxIcon: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#64748B',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkboxCheckmark: {
    color: '#fff',
    fontWeight: 'bold',
  },
  checkboxText: {
    color: '#64748B',
    fontSize: 14,
  },
  politicasLink: {
    textDecorationLine: 'underline',
    color: '#2563EB',
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: Platform.OS === 'web' ? 18 : 16,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#CBD5E1',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#94A3B8',
  },
  secondaryButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#2563EB',
    fontWeight: '600',
  },
  contentContainerStyle: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
});
