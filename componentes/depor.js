import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';

import styles from './estilos';

export default function Depor() {
  const [pistas, setPistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log("Llamando al backend...");
    axios.get("http://localhost:3001/polideportivo") // cambiar la cuando tengamos el servidor en remoto
      .then((res) => {
        console.log("Datos recibidos:", res.data);
        setPistas(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al obtener las pistas:", err);
        setError("No se pudo cargar las pistas.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Pistas del Polideportivo</Text>
      <FlatList
        data={pistas}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.pistaContainer}>
            <Text style={styles.pistaText}>
              <Text style={{ fontWeight: 'bold' }}>Nombre:</Text> {item.nombre}
            </Text>
            <Text style={styles.pistaText}>
              <Text style={{ fontWeight: 'bold' }}>Tipo:</Text> {item.tipo}
            </Text>
            <Text style={styles.pistaText}>
              <Text style={{ fontWeight: 'bold' }}>Disponible:</Text> {item.disponible ? "SI" : "No"}
            </Text>
          </View>
        )}
      />
    </View>
  );
}


