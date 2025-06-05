import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Platform, ActivityIndicator } from 'react-native';

export default function ResumenReserva({ route, navigation }) {
  const reserva = route?.params?.reserva;
  const [nombreTarjeta, setNombreTarjeta] = useState('');
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [fechaExpiracion, setFechaExpiracion] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('Datos recibidos en ResumenReserva:', reserva);
  }, [reserva]);

  if (!reserva) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.errorTexto}>No se han recibido datos de la reserva.</Text>
      </View>
    );
  }

  // Validación de tarjeta con algoritmo de Luhn
  const validarTarjeta = (numero) => {
    const limpio = numero.replace(/\D/g, '');
    if (limpio.length < 13 || limpio.length > 19) return false;
    
    let suma = 0;
    let alternar = false;
    
    for (let i = limpio.length - 1; i >= 0; i--) {
      let n = parseInt(limpio.charAt(i), 10);
      if (alternar) {
        n *= 2;
        if (n > 9) n = (n % 10) + 1;
      }
      suma += n;
      alternar = !alternar;
    }
    return suma % 10 === 0;
  };

  // Validación de fecha MM/AA
  const validarFecha = (fecha) => {
    const [mes, anio] = fecha.split('/');
    if (!mes || !anio || mes.length !== 2 || anio.length !== 2) return false;

    const mesNum = parseInt(mes, 10);
    const anioNum = parseInt(anio, 10);
    const anioCompleto = 2000 + anioNum; // Asumimos siglo XXI
    
    if (isNaN(mesNum) || isNaN(anioNum)) return false;
    if (mesNum < 1 || mesNum > 12) return false;

    const ahora = new Date();
    const mesActual = ahora.getMonth() + 1;
    const anioActual = ahora.getFullYear() % 100;
    
    // Comprobar si la fecha es mayor o igual al mes actual
    if (anioNum > anioActual) return true;
    if (anioNum === anioActual && mesNum >= mesActual) return true;
    
    return false;
  };

  const manejarPago = async () => {
    // Validaciones básicas
    if (!nombreTarjeta.trim()) {
      Alert.alert('Error', 'Por favor ingrese el nombre en la tarjeta');
      return;
    }

    if (!numeroTarjeta || numeroTarjeta.length < 13) {
      Alert.alert('Error', 'Número de tarjeta incompleto');
      return;
    }

    if (!validarTarjeta(numeroTarjeta)) {
      Alert.alert('Error', 'Número de tarjeta inválido');
      return;
    }

    if (!fechaExpiracion || fechaExpiracion.length !== 5) {
      Alert.alert('Error', 'Fecha de expiración incompleta (MM/AA)');
      return;
    }

    if (!validarFecha(fechaExpiracion)) {
      Alert.alert('Error', 'La tarjeta está expirada o fecha inválida');
      return;
    }

    if (!cvv || cvv.length < 3) {
      Alert.alert('Error', 'CVV incompleto (3-4 dígitos)');
      return;
    }

    setLoading(true);

    try {
      // Usar el endpoint correcto para marcar como pagado
     const respuesta = await fetch(`http://localhost:3001/reservas/${reserva.id}/pagar`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  }
});

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.error || 'Error al procesar el pago');
      }

      // Mostrar confirmación
      const mensaje = `Pago de ${reserva.precio} € procesado correctamente.\n\n` +
                     `Reserva #${reserva.id} - ${reserva.nombre_pista}\n` +
                     `Estado: Pagado`;

      if (Platform.OS === 'web') {
        alert(mensaje);
      } else {
        Alert.alert('Pago exitoso', mensaje);
      }

      // Navegar de vuelta o a pantalla de confirmación
      navigation.navigate('ConfirmacionPago', { 
        reserva: {
          ...reserva,
          estado: 'pagado'
        }
      });

    } catch (error) {
      console.error('Error en el pago:', error);
      Alert.alert('Error', error.message || 'Ocurrió un error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  const formatoTarjeta = (numero) => {
    const limpio = numero.replace(/\D/g, '');
    const partes = [];
    for (let i = 0; i < limpio.length; i += 4) {
      partes.push(limpio.substr(i, 4));
    }
    return partes.join(' ');
  };

  const formatoFechaLegible = (fechaISO) => {
    if (!fechaISO) return 'No especificado';
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fechaISO).toLocaleDateString('es-ES', opciones);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Resumen de la Reserva</Text>

      <View style={styles.seccion}>
        <Text style={styles.subtitulo}>Detalles de la Reserva</Text>
        
        <View style={styles.dato}>
          <Text style={styles.label}>Usuario:</Text>
          <Text style={styles.valor}>{reserva.nombre_usuario || 'Desconocido'}</Text>
        </View>
        <View style={styles.dato}>
          <Text style={styles.label}>Pista:</Text>
          <Text style={styles.valor}>{reserva.nombre_pista || reserva.pista || 'No especificado'}</Text>
        </View>
        <View style={styles.dato}>
          <Text style={styles.label}>Tipo:</Text>
          <Text style={styles.valor}>{reserva.tipo_pista || 'No especificado'}</Text>
        </View>
        <View style={styles.dato}>
          <Text style={styles.label}>Fecha:</Text>
          <Text style={styles.valor}>{formatoFechaLegible(reserva.fecha)}</Text>
        </View>
        <View style={styles.dato}>
          <Text style={styles.label}>Horario:</Text>
          <Text style={styles.valor}>{reserva.hora_inicio} - {reserva.hora_fin}</Text>
        </View>
        <View style={styles.dato}>
          <Text style={styles.label}>Ludoteca:</Text>
          <Text style={styles.valor}>{reserva.ludoteca ? 'Sí' : 'No'}</Text>
        </View>
        <View style={styles.dato}>
          <Text style={styles.label}>Estado:</Text>
          <Text style={[styles.valor, reserva.estado === 'pagado' ? styles.estadoPagado : styles.estadoPendiente]}>
            {reserva.estado || 'Pendiente'}
          </Text>
        </View>
        <View style={styles.dato}>
          <Text style={styles.label}>Precio Total:</Text>
          <Text style={styles.precio}>{reserva.precio} €</Text>
        </View>
      </View>

      {reserva.estado !== 'pagado' && (
        <View style={styles.seccion}>
          <Text style={styles.subtitulo}>Datos de Pago</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Nombre en la tarjeta"
            value={nombreTarjeta}
            onChangeText={setNombreTarjeta}
            autoCapitalize="words"
            maxLength={50}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Número de tarjeta (ej: 4242 4242 4242 4242)"
            value={formatoTarjeta(numeroTarjeta)}
            onChangeText={(text) => setNumeroTarjeta(text.replace(/\D/g, ''))}
            keyboardType="numeric"
            maxLength={19}
          />
          
          <View style={styles.filaInputs}>
            <TextInput
              style={[styles.input, styles.inputMedio]}
              placeholder="MM/AA"
              value={fechaExpiracion}
              onChangeText={(text) => {
                const limpio = text.replace(/[^0-9]/g, '');
                if (limpio.length > 2) {
                  setFechaExpiracion(`${limpio.substring(0, 2)}/${limpio.substring(2, 4)}`);
                } else {
                  setFechaExpiracion(limpio);
                }
              }}
              keyboardType="numeric"
              maxLength={5}
            />
            
            <TextInput
              style={[styles.input, styles.inputMedio]}
              placeholder="CVV"
              value={cvv}
              onChangeText={(text) => setCvv(text.replace(/\D/g, '').slice(0, 4))}
              keyboardType="numeric"
              secureTextEntry={true}
              maxLength={4}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.botonPagar} 
            onPress={manejarPago}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.botonTexto}>Pagar Ahora</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    paddingBottom: 40,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: '#2C3E50',
    textAlign: 'center',
  },
  seccion: {
    marginBottom: 25,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 15,
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#34495E',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
    paddingBottom: 8,
  },
  dato: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  label: {
    fontWeight: '600',
    width: 120,
    color: '#7F8C8D',
    fontSize: 15,
  },
  valor: {
    flex: 1,
    color: '#2C3E50',
    fontSize: 15,
  },
  precio: {
    flex: 1,
    color: '#27AE60',
    fontSize: 16,
    fontWeight: '700',
  },
  estadoPagado: {
    color: '#27AE60',
    fontWeight: '600',
  },
  estadoPendiente: {
    color: '#F39C12',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#FFF',
  },
  filaInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputMedio: {
    width: '48%',
  },
  botonPagar: {
    backgroundColor: '#2ECC71',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  botonTexto: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTexto: {
    color: '#E74C3C',
    fontSize: 18,
    textAlign: 'center',
  },
});