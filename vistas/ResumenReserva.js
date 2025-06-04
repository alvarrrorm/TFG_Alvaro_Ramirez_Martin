import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Platform } from 'react-native';

export default function ResumenReserva({ route, navigation }) {
  const reserva = route?.params?.reserva;

  const [nombreTarjeta, setNombreTarjeta] = useState('');
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [fechaExpiracion, setFechaExpiracion] = useState('');
  const [cvv, setCvv] = useState('');

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

  // Validación Luhn para número de tarjeta
  const validarTarjeta = (numero) => {
    const limpio = numero.replace(/\D/g, '');
    let suma = 0;
    let alternar = false;
    for (let i = limpio.length - 1; i >= 0; i--) {
      let n = parseInt(limpio.charAt(i), 10);
      if (alternar) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      suma += n;
      alternar = !alternar;
    }
    return suma % 10 === 0;
  };

  // Validar formato MM/AA y que no sea fecha pasada
  const validarFecha = (fecha) => {
    const [mes, anio] = fecha.split('/');
    if (!mes || !anio || mes.length !== 2 || anio.length !== 2) return false;

    const mesNum = parseInt(mes, 10);
    const anioNum = parseInt('20' + anio, 10);
    if (isNaN(mesNum) || isNaN(anioNum)) return false;
    if (mesNum < 1 || mesNum > 12) return false;

    const ahora = new Date();
    const fechaExp = new Date(anioNum, mesNum - 1, 1);
    // Comparar con primer día del mes actual
    return fechaExp >= new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  };

  const manejarPago = async () => {
    if (!nombreTarjeta || !numeroTarjeta || !fechaExpiracion || !cvv) {
      Alert.alert('Error', 'Por favor, completa todos los campos de pago.');
      return;
    }

    const regexNumeroTarjeta = /^\d{16}$/;
    const regexFecha = /^(0[1-9]|1[0-2])\/\d{2}$/;
    const regexCVV = /^\d{3,4}$/;

    if (!regexNumeroTarjeta.test(numeroTarjeta)) {
      Alert.alert('Error', 'El número de tarjeta debe contener exactamente 16 dígitos numéricos.');
      return;
    }

    if (!validarTarjeta(numeroTarjeta)) {
      Alert.alert('Error', 'Número de tarjeta inválido (falla validación Luhn).');
      return;
    }

    if (!regexFecha.test(fechaExpiracion) || !validarFecha(fechaExpiracion)) {
      Alert.alert('Error', 'La fecha de expiración es inválida. Usa el formato MM/AA y asegúrate de que no sea una fecha pasada.');
      return;
    }

    if (!regexCVV.test(cvv)) {
      Alert.alert('Error', 'CVV inválido. Debe tener 3 o 4 dígitos numéricos.');
      return;
    }

    try {
      const respuesta = await fetch(`http://localhost:3001/reservas/${reserva.id}/pagar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'pagado' }),
      });

      const data = await respuesta.json();

      if (respuesta.ok) {
        if (Platform.OS === 'web') {
          window.alert(`Se ha procesado el pago de ${reserva.precio} € correctamente.`);
          navigation.navigate('Reservas');
        } else {
          Alert.alert('Pago realizado', `Se ha procesado el pago de ${reserva.precio} € correctamente.`, [
            { text: 'OK', onPress: () => navigation.navigate('Reservas') },
          ]);
        }
      } else {
        Alert.alert('Error', data?.mensaje || 'Error al procesar el pago.');
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      Alert.alert('Error', 'Error de red al actualizar el estado.');
    }
  };

  // Formato legible para fecha ISO
  const formatoFechaLegible = (fechaISO) => {
    if (!fechaISO) return 'No especificado';
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fechaISO).toLocaleDateString('es-ES', opciones);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Resumen de la Reserva</Text>

      <View style={styles.dato}>
        <Text style={styles.label}>Usuario:</Text>
        <Text style={styles.valor}>{reserva.nombre_usuario || 'Desconocido'}</Text>
      </View>

      <View style={styles.dato}>
        <Text style={styles.label}>Pista:</Text>
        <Text style={styles.valor}>{reserva.pista || 'No especificado'}</Text>
      </View>

      <View style={styles.dato}>
        <Text style={styles.label}>Fecha:</Text>
        <Text style={styles.valor}>{formatoFechaLegible(reserva.fecha)}</Text>
      </View>

      <View style={styles.dato}>
        <Text style={styles.label}>Hora Inicio:</Text>
        <Text style={styles.valor}>{reserva.hora_inicio || 'No especificado'}</Text>
      </View>

      <View style={styles.dato}>
        <Text style={styles.label}>Hora Fin:</Text>
        <Text style={styles.valor}>{reserva.hora_fin || 'No especificado'}</Text>
      </View>

      <View style={styles.dato}>
        <Text style={styles.label}>Ludoteca:</Text>
        <Text style={styles.valor}>{reserva.ludoteca ? 'Sí' : 'No'}</Text>
      </View>

      <View style={styles.dato}>
        <Text style={styles.label}>Estado:</Text>
        <Text style={styles.valor}>{reserva.estado || 'Pendiente'}</Text>
      </View>

      <View style={styles.dato}>
        <Text style={styles.label}>Precio Total:</Text>
        <Text style={styles.valor}>{reserva.precio} €</Text>
      </View>

      <Text style={[styles.titulo, { marginTop: 20 }]}>Datos de Pago</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre en la tarjeta"
        value={nombreTarjeta}
        onChangeText={setNombreTarjeta}
      />

      <TextInput
        style={styles.input}
        placeholder="Número de tarjeta (16 dígitos)"
        value={numeroTarjeta}
        onChangeText={(texto) => {
          const soloNumeros = texto.replace(/\D/g, '');
          if (soloNumeros.length <= 16) {
            setNumeroTarjeta(soloNumeros);
          }
        }}
        keyboardType="numeric"
        maxLength={16}
      />

      <TextInput
        style={styles.input}
        placeholder="Fecha expiración (MM/AA)"
        value={fechaExpiracion}
        onChangeText={setFechaExpiracion}
        keyboardType="numeric"
        maxLength={5}
      />

      <TextInput
        style={styles.input}
        placeholder="CVV"
        value={cvv}
        onChangeText={setCvv}
        keyboardType="numeric"
        maxLength={4}
        secureTextEntry={true}
      />

      <TouchableOpacity style={styles.boton} onPress={manejarPago}>
        <Text style={styles.botonTexto}>Pagar</Text>
      </TouchableOpacity>
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
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 15,
    color: '#222',
  },
  dato: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    fontWeight: '600',
    width: 140,
    color: '#444',
  },
  valor: {
    flex: 1,
    color: '#000',
  },
  input: {
    borderColor: '#888',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  boton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 10,
    alignItems: 'center',
  },
  botonTexto: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTexto: {
    color: 'red',
    fontSize: 18,
  },
});
