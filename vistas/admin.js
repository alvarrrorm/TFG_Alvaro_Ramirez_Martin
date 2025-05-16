import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  FlatList,
  TextInput,
} from 'react-native';
import { useUser } from '../contexto/UserContex';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import { ScrollView } from 'react-native'; 


export default function AdminPanel({ navigation }) {
  const { usuario, logout } = useUser();
  const [pistas, setPistas] = useState([]);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoTipo, setNuevoTipo] = useState('');

  useEffect(() => {
    fetchPistas();
  }, []);

  const fetchPistas = async () => {
    try {
      const data = [
        { id: 1, nombre: 'Pista Central', enMantenimiento: false, tipo: 'Tierra batida' },
        { id: 2, nombre: 'Pista Cubierta', enMantenimiento: false, tipo: 'Dura' },
        { id: 3, nombre: 'Pista Norte', enMantenimiento: true, tipo: 'Hierba' },
      ];
      setPistas(data);
    } catch (error) {
      console.error('Error al cargar pistas:', error);
    }
  };

  const agregarPista = () => {
    if (!nuevoNombre || !nuevoTipo) {
      Alert.alert('Error', 'Nombre y tipo son obligatorios');
      return;
    }
    const nuevaPista = {
      id: pistas.length + 1,
      nombre: nuevoNombre,
      tipo: nuevoTipo,
      enMantenimiento: false,
    };
    setPistas([...pistas, nuevaPista]);
    setNuevoNombre('');
    setNuevoTipo('');
  };

  const eliminarPista = (id) => {
    if (typeof window !== 'undefined' && window.confirm) {
      if (window.confirm('¿Seguro que quieres eliminar esta pista?')) {
        setPistas(currentPistas => currentPistas.filter(p => p.id !== id));
      }
    } else {
      Alert.alert(
        'Confirmar',
        '¿Eliminar esta pista?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: () =>
              setPistas(currentPistas =>
                currentPistas.filter(p => p.id !== id)
              ),
          },
        ],
        { cancelable: true }
      );
    }
  };

  const marcarMantenimiento = (id) => {
    const actualizadas = pistas.map(p =>
      p.id === id ? { ...p, enMantenimiento: !p.enMantenimiento } : p
    );
    setPistas(actualizadas);
  };

  const renderPista = ({ item }) => (
    <View style={styles.pistaCard}>
      <View style={styles.pistaHeader}>
        <Text style={styles.pistaTitulo}>{item.nombre}</Text>
        <View style={styles.estadoContainer}>
          <View
            style={[
              styles.estadoIndicator,
              { backgroundColor: item.enMantenimiento ? '#FFA500' : '#4CAF50' },
            ]}
          />
          <Text style={styles.estadoTexto}>
            {item.enMantenimiento ? 'Mantenimiento' : 'Disponible'}
          </Text>
        </View>
      </View>
      <Text style={styles.pistaSubtitulo}>
        Tipo: <Text style={styles.pistaTexto}>{item.tipo}</Text>
      </Text>
      <View style={styles.pistaAcciones}>
        <TouchableOpacity
          style={styles.accionBtn}
          onPress={() => marcarMantenimiento(item.id)}
        >
          <MaterialIcons
            name={item.enMantenimiento ? 'handyman' : 'construction'}
            size={20}
            color={item.enMantenimiento ? '#FFA500' : '#607D8B'}
          />
          <Text style={styles.accionTexto}>
            {item.enMantenimiento ? 'Reactivar' : 'Mantenimiento'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.accionBtn, styles.eliminarBtn]}
          onPress={() => eliminarPista(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#F44336" />
          <Text style={[styles.accionTexto, styles.eliminarTexto]}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.titulo}>Panel de Administrador</Text>
          <Text style={styles.subtitulo}>Bienvenido, {usuario?.nombre || 'Administrador'}</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitulo}>Agregar Nueva Pista</Text>
          <View style={styles.agregarForm}>
            <TextInput
              placeholder="Nombre de pista"
              placeholderTextColor="#999"
              value={nuevoNombre}
              onChangeText={setNuevoNombre}
              style={styles.input}
            />
            <TextInput
              placeholder="Tipo de pista (ej: Tierra batida, Dura)"
              placeholderTextColor="#999"
              value={nuevoTipo}
              onChangeText={setNuevoTipo}
              style={styles.input}
            />
            <TouchableOpacity style={styles.botonAgregar} onPress={agregarPista}>
              <Text style={styles.botonTexto}>Agregar Pista</Text>
              <Ionicons name="add-circle-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.listaContainer}>
          <Text style={styles.listaTitulo}>Pistas Disponibles ({pistas.length})</Text>
          <FlatList
            data={pistas}
            renderItem={renderPista}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listaContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  listaContent: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    maxWidth: 800,
    alignSelf: 'center',
    width: '90%',
  },
  header: {
    marginBottom: 25,
  },
  titulo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 5,
    alignSelf: 'center'
  },
  subtitulo: {
    fontSize: 16,
    color: '#7F8C8D',
    alignSelf:'center',
    textAlign: 'center'
    },

 formContainer: {
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  padding: 20,
  marginBottom: 25,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 6,
  elevation: 3,
  maxWidth: 800,
  alignSelf: 'center',
  width: '90%',
},

  
  formTitulo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 15,
  },
  agregarForm: {
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#F5F7FA',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
    color: '#34495E',
  },
  botonAgregar: {
    backgroundColor: '#3498DB',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  botonTexto: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  listaTitulo: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 15,
    textAlign: 'center'
  },
  pistaCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  pistaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pistaTitulo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  estadoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  estadoIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  estadoTexto: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  pistaSubtitulo: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 5,
  },
  pistaTexto: {
    color: '#34495E',
    fontWeight: '500',
  },
  pistaAcciones: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
    gap: 15,
  },
  accionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#ECF0F1',
    gap: 5,
  },
  accionTexto: {
    fontSize: 14,
    color: '#34495E',
    fontWeight: '500',
  },
  eliminarBtn: {
    backgroundColor: '#FDEDED',
  },
  eliminarTexto: {
    color: '#F44336',
  },
});
