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
  ScrollView,
  Platform,
  Dimensions
} from 'react-native';
import { useUser } from '../contexto/UserContex';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';

const API_URL = 'https://51.44.193.22:3001/pistas';

export default function AdminPanel({ navigation }) {
  const { usuario } = useUser();
  const [pistas, setPistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoTipo, setNuevoTipo] = useState(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: 'Fútbol', value: 'Fútbol' },
    { label: 'Baloncesto', value: 'Baloncesto' },
    { label: 'Tenis', value: 'Tenis' },
    { label: 'Padel', value: 'Padel' },
    {label: 'Voley', value: 'Voley'},
    {label: 'Futbol Sala', value: 'Futbol Sala'}
  ]);
  const [errorNombreRepetido, setErrorNombreRepetido] = useState('');

  // Cargar pistas desde la API
  const fetchPistas = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(API_URL);

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
    setErrorNombreRepetido('');
    if (!nuevoNombre.trim() || !nuevoTipo) {
      Alert.alert('Error', 'Nombre y tipo son obligatorios');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: nuevoNombre.trim(),
          tipo: nuevoTipo,
        }),
      });

      const responseData = await response.json();

      if (response.status === 409) {
        setErrorNombreRepetido(responseData.message || 'Ya existe una pista con ese nombre.');
        return;
      }

      if (!response.ok) {
        throw new Error(responseData.message || `Error ${response.status}`);
      }

      setPistas((prevPistas) => [...prevPistas, responseData]);
      setNuevoNombre('');
      setNuevoTipo(null);
      setOpen(false);
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
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
              });

              if (!response.ok) {
                throw new Error('Error al eliminar la pista');
              }

              setPistas(pistas.filter(pista => pista.id !== id));
              Alert.alert('Éxito', 'Pista eliminada correctamente');
            } catch (error) {
              console.error('Error al eliminar pista:', error);
              Alert.alert('Error', 'No se pudo eliminar la pista');
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

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enMantenimiento: !pista.enMantenimiento
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el estado');
      }

      const pistaActualizada = await response.json();
      setPistas(pistas.map(p => p.id === id ? pistaActualizada : p));
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
    <FlatList
      data={pistas}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      refreshing={refreshing}
      onRefresh={fetchPistas}
      ListHeaderComponent={
        <>
          <View style={styles.header}>
            <Text style={styles.titulo}>Panel de Administración</Text>
            <Text style={styles.subtitulo}>
              Bienvenido, {usuario?.nombre || 'Administrador'}
            </Text>
          </View>

          <View style={{ zIndex: 3000 }}>
            <View style={styles.formularioContainer}>
              <Text style={styles.seccionTitulo}>Agregar Nueva Pista</Text>

              <TextInput
                style={styles.input}
                placeholder="Nombre de la pista"
                value={nuevoNombre}
                onChangeText={text => {
                  setNuevoNombre(text);
                  setErrorNombreRepetido('');
                }}
                placeholderTextColor="#999"
              />
              {errorNombreRepetido ? (
                <Text style={styles.errorTexto}>{errorNombreRepetido}</Text>
              ) : null}

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
                style={[
                  styles.botonAgregar,
                  (!nuevoNombre.trim() || !nuevoTipo) && styles.botonDisabled,
                ]}
                onPress={agregarPista}
                disabled={!nuevoNombre.trim() || !nuevoTipo}
              >
                <Text style={styles.botonAgregarTexto}>Agregar Pista</Text>
                <Ionicons name="add-circle-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.listaContainer}>
            <Text style={styles.seccionTitulo}>
              Pistas Disponibles ({pistas.length})
            </Text>

            {pistas.length === 0 && (
              <Text style={styles.listaVacia}>No hay pistas registradas</Text>
            )}
          </View>
        </>
      }
      contentContainerStyle={{
        padding: 20,
        width: windowWidth > 600 ? 600 : '100%',
        alignSelf: 'center',
        paddingBottom: 40,
      }}
      style={Platform.OS === 'web' ? { height: '100vh' } : {}}
    />
  </SafeAreaView>
);
}

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContainer: {
    padding: 24,
    paddingBottom: 32,
    width: windowWidth > 600 ? 600 : '100%',
    alignSelf: 'center',
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  subtitulo: {
    fontSize: 18,
    color: '#7F8C8D',
    marginTop: 4,
  },
  formularioContainer: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    width: '100%',
  },
  seccionTitulo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#34495E',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    fontSize: 16,
    backgroundColor: '#FDFEFE',
    width: '100%',
  },
  errorTexto: {
    color: '#E74C3C',
    fontWeight: '600',
    marginBottom: 12,
    fontSize: 14,
  },
  dropdown: {
    borderColor: '#BDC3C7',
    marginBottom: 16,
    borderRadius: 10,
    width: '100%',
  },
  dropdownContainer: {
    borderColor: '#BDC3C7',
    borderRadius: 10,
  },
  botonAgregar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498DB',
    borderRadius: 10,
    padding: 14,
    width: '100%',
  },
  botonDisabled: {
    backgroundColor: '#A9CCE3',
  },
  botonAgregarTexto: {
    color: 'white',
    fontWeight: '700',
    marginRight: 8,
    fontSize: 16,
  },
  listaContainer: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    width: '100%',
  },
  listaVacia: {
    textAlign: 'center',
    color: '#7F8C8D',
    marginVertical: 20,
    fontSize: 16,
  },
  pistaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ECF0F1',
    width: '100%',
  },
  pistaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pistaNombre: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
  },
  estadoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  estadoIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 6,
  },
  estadoTexto: {
    fontSize: 15,
    color: '#7F8C8D',
  },
  pistaTipo: {
    fontSize: 15,
    color: '#7F8C8D',
    marginBottom: 14,
  },
  accionesContainer: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  botonAccion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E1E8ED',
    marginLeft: 12,
  },
  botonEliminar: {
    backgroundColor: '#FDECEA',
  },
  textoAccion: {
    marginLeft: 6,
    fontWeight: '600',
    fontSize: 14,
    color: '#34495E',
  },
  textoEliminar: {
    color: '#E74C3C',
  },
});