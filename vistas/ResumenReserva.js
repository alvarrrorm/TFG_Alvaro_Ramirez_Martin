import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';

export default function ResumenReserva({ route, navigation }) {
  const reserva = route?.params?.reserva;

  useEffect(() => {
    console.log('Datos recibidos en ResumenReserva:', reserva);
  }, [reserva]);

  if (!reserva) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.errorTexto}>
          No se han recibido datos de la reserva.
        </Text>
      </View>
    );
  }

  const manejarPago = () => {
    Alert.alert('Pago', `Se ha procesado el pago de ${reserva.precio} € correctamente.`, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const manejarVolver = () => {
    navigation.goBack();
  };

  // Lista de datos a mostrar ordenados
  const datosMostrar = [
    { label: 'Usuario', valor: reserva.nombre_usuario || 'Desconocido' },
    { label: 'Pista', valor: reserva.pista || 'No especificado' },
    { label: 'Fecha', valor: reserva.fecha || 'No especificado' },
    { label: 'Hora Inicio', valor: reserva.hora_inicio || 'No especificado' },
    { label: 'Hora Fin', valor: reserva.hora_fin || 'No especificado' },
    { label: 'Ludoteca', valor: reserva.ludoteca ? 'Sí' : 'No' },
    { label: 'Estado', valor: reserva.estado || 'Pendiente' },
    { label: 'Precio total', valor: reserva.precio !== undefined && reserva.precio !== null ? `${reserva.precio} €` : 'No especificado' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Resumen de la Reserva</Text>

      {datosMostrar.map(({ label, valor }) => (
        <View key={label} style={styles.item}>
          <Text style={styles.label}>{label}:</Text>
          <Text style={styles.valor}>{valor}</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.botonVolver} onPress={manejarVolver}>
        <Text style={styles.textoBotonVolver}>← Volver</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botonPago} onPress={manejarPago}>
        <Text style={styles.textoBoton}>Pagar Ahora</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#f5f8fa',
    flexGrow: 1,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 24,
    textAlign: 'center',
  },
  item: {
    marginBottom: 18,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#00000020',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontWeight: '700',
    fontSize: 16,
    color: '#555',
  },
  valor: {
    fontSize: 18,
    color: '#222',
    marginTop: 6,
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTexto: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
  botonVolver: {
    marginTop: 30,
    backgroundColor: '#e0e0e0',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  textoBotonVolver: {
    color: '#555',
    fontSize: 16,
    fontWeight: '600',
  },
  botonPago: {
    marginTop: 16,
    backgroundColor: '#1976D2',
    paddingVertical: 14,
    borderRadius: 8,
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    alignItems: 'center',
  },
  textoBoton: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
