import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  FlatList,
  TextInput,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useUser } from '../contexto/UserContex';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';

const API_URL = 'http://localhost:3001'; // Asegúrate que esta URL sea correcta para tu entorno

export default function AdminPanel({ navigation }) {
  const { usuario } = useUser();
  const [pistas, setPistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoTipo, setNuevoTipo] = useState(null);

  // Configuración del dropdown
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: 'Fútbol', value: 'Fútbol' },
    { label: 'Baloncesto', value: 'Baloncesto' },
    { label: 'Tenis', value: 'Tenis' },
    { label: 'Tierra batida', value: 'Tierra batida' },
    { label: 'Dura', value: 'Dura' },
    { label: 'Hierba', value: 'Hierba' },
  ]);

  // Cargar pistas desde la API
  const fetchPistas = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`${API_URL}/pistas`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }
      
      const data = await response.json();
      setPistas(data);
    } catch (error) {
      console.error('Error al cargar pistas:', error);
      Alert.alert('Error', 'No se pudieron cargar las pistas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPistas();
  }, []);

  // Agregar nueva pista
  const agregarPista = async () => {
  if (!nuevoNombre.trim()) {
    Alert.alert('Error', 'El nombre de la pista es obligatorio');
    return;
  }

  if (!nuevoTipo) {
    Alert.alert('Error', 'Debes seleccionar un tipo de pista');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/pistas`, {  // Nota el /api/ añadido
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre: nuevoNombre.trim(),
        tipo: nuevoTipo,
        enMantenimiento: false
      }),
    });

    // Verifica si la respuesta no es JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Respuesta inesperada: ${text}`);
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al agregar pista');
    }

    const nuevaPista = await response.json();
    
    setPistas([...pistas, nuevaPista]);
    setNuevoNombre('');
    setNuevoTipo(null);
    
    Alert.alert('Éxito', 'Pista agregada correctamente');
  } catch (error) {
    console.error('Error al agregar pista:', error);
    Alert.alert('Error', error.message || 'No se pudo agregar la pista');
  }
};

  // Eliminar pista
  const eliminarPista = (id) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar esta pista?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/pistas/${id}`, {
                method: 'DELETE',
              });

              if (!response.ok) {
                throw new Error('Error al eliminar la pista');
              }

              setPistas(pistas.filter(pista => pista.id !== id));
              Alert.alert('Éxito', 'Pista eliminada correctamente');
            } catch (error) {
              console.error('Error al eliminar pista:', error);
              Alert.alert('Error', error.message || 'No se pudo eliminar la pista');
            }
          },
        },
      ]
    );
  };

  // Cambiar estado de mantenimiento
  const toggleMantenimiento = async (id) => {
    try {
      const pista = pistas.find(p => p.id === id);
      if (!pista) return;

      const response = await fetch(`${API_URL}/pistas/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enMantenimiento: !pista.enMantenimiento
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el estado de la pista');
      }

      const pistaActualizada = await response.json();
      
      setPistas(pistas.map(p => 
        p.id === id ? pistaActualizada : p
      ));
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      Alert.alert('Error', error.message || 'No se pudo cambiar el estado');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.pistaCard}>
      <View style={styles.pistaHeader}>
        <Text style={styles.pistaNombre}>{item.nombre}</Text>
        <View style={styles.estadoContainer}>
          <View style={[
            styles.estadoIndicator,
            { backgroundColor: item.enMantenimiento ? '#FFA500' : '#4CAF50' }
          ]} />
          <Text style={styles.estadoTexto}>
            {item.enMantenimiento ? 'En mantenimiento' : 'Disponible'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.pistaTipo}>Tipo: {item.tipo}</Text>
      
      <View style={styles.accionesContainer}>
        <TouchableOpacity 
          style={styles.botonAccion}
          onPress={() => toggleMantenimiento(item.id)}
        >
          <MaterialIcons 
            name={item.enMantenimiento ? 'handyman' : 'construction'} 
            size={20} 
            color={item.enMantenimiento ? '#FFA500' : '#607D8B'} 
          />
          <Text style={styles.textoAccion}>
            {item.enMantenimiento ? 'Reactivar' : 'Mantenimiento'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.botonAccion, styles.botonEliminar]}
          onPress={() => eliminarPista(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#F44336" />
          <Text style={[styles.textoAccion, styles.textoEliminar]}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498DB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.titulo}>Panel de Administración</Text>
          <Text style={styles.subtitulo}>
            Bienvenido, {usuario?.nombre || 'Administrador'}
          </Text>
        </View>

        <View style={styles.formularioContainer}>
          <Text style={styles.seccionTitulo}>Agregar Nueva Pista</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Nombre de la pista"
            value={nuevoNombre}
            onChangeText={setNuevoNombre}
            placeholderTextColor="#999"
          />
          
          <DropDownPicker
            open={open}
            value={nuevoTipo}
            items={items}
            setOpen={setOpen}
            setValue={setNuevoTipo}
            setItems={setItems}
            placeholder="Seleccionar tipo"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            zIndex={3000}
            zIndexInverse={1000}
          />
          
          <TouchableOpacity 
            style={styles.botonAgregar}
            onPress={agregarPista}
            disabled={!nuevoNombre.trim() || !nuevoTipo}
          >
            <Text style={styles.botonAgregarTexto}>Agregar Pista</Text>
            <Ionicons name="add-circle-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.listaContainer}>
          <Text style={styles.seccionTitulo}>
            Pistas Disponibles ({pistas.length})
          </Text>
          
          {pistas.length === 0 ? (
            <Text style={styles.listaVacia}>No hay pistas registradas</Text>
          ) : (
            <FlatList
              data={pistas}
              renderItem={renderItem}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false} // Para ScrollView anidado
              refreshing={refreshing}
              onRefresh={fetchPistas}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  subtitulo: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 4,
  },
  formularioContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34495E',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#FDFEFE',
  },
  dropdown: {
    borderColor: '#BDC3C7',
    marginBottom: 12,
  },
  dropdownContainer: {
    borderColor: '#BDC3C7',
  },
  botonAgregar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498DB',
    borderRadius: 8,
    padding: 12,
  },
  botonAgregarTexto: {
    color: 'white',
    fontWeight: '600',
    marginRight: 8,
  },
  listaContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  listaVacia: {
    textAlign: 'center',
    color: '#7F8C8D',
    marginVertical: 16,
  },
  pistaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ECF0F1',
  },
  pistaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pistaNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  estadoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  estadoIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  estadoTexto: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  pistaTipo: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
  },
  accionesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  botonAccion: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  textoAccion: {
    marginLeft: 4,
    fontSize: 14,
    color: '#3498DB',
  },
  botonEliminar: {
    marginLeft: 16,
  },
  textoEliminar: {
    color: '#F44336',
  },
});