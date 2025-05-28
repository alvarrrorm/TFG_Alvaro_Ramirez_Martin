import React, { useState, useEffect, useCallback } from 'react';
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
  Dimensions,
  SectionList,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { useUser } from '../contexto/UserContex';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';

const API_URL = 'http://localhost:3001/pistas';
const RESERVAS_URL = 'http://localhost:3001/reservas';

export default function AdminPanel({ navigation }) {
  const { usuario } = useUser();
  const [pistas, setPistas] = useState([]);
  const [reservas, setReservas] = useState([]);
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
    { label: 'Voley', value: 'Voley' },
    { label: 'Futbol Sala', value: 'Futbol Sala' }
  ]);
  const [errorNombreRepetido, setErrorNombreRepetido] = useState('');
  const [activeTab, setActiveTab] = useState('pistas');
  const { width, height } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  // Cargar pistas y reservas desde la API
  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      
      // Cargar pistas
      const pistasResponse = await fetch(API_URL);
      if (!pistasResponse.ok) throw new Error(`Error ${pistasResponse.status}: ${await pistasResponse.text()}`);
      const pistasData = await pistasResponse.json();
      setPistas(pistasData);
      
      // Cargar reservas
      const reservasResponse = await fetch(RESERVAS_URL);
      if (!reservasResponse.ok) throw new Error(`Error ${reservasResponse.status}: ${await reservasResponse.text()}`);
      const reservasData = await reservasResponse.json();
      setReservas(reservasData);
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Agrupar pistas por tipo para el SectionList
  const pistasPorTipo = pistas.reduce((acc, pista) => {
    const tipo = pista.tipo;
    if (!acc[tipo]) {
      acc[tipo] = [];
    }
    acc[tipo].push(pista);
    return acc;
  }, {});

  const sections = Object.keys(pistasPorTipo).map(tipo => ({
    title: tipo,
    data: pistasPorTipo[tipo]
  }));

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
    if (Platform.OS === 'web') {
      const confirmar = window.confirm('¿Estás seguro de que deseas eliminar esta pista?');
      if (confirmar) {
        handleEliminar(id);
      }
    } else {
      Alert.alert(
        'Confirmar eliminación',
        '¿Estás seguro de que deseas eliminar esta pista?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: () => handleEliminar(id),
          },
        ]
      );
    }
  };

  const handleEliminar = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error('Error al eliminar la pista');
      }

      setPistas((prevPistas) => prevPistas.filter((pista) => pista.id !== id));
      Alert.alert('Éxito', 'Pista eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar pista:', error);
      Alert.alert('Error', 'No se pudo eliminar la pista');
    }
  };

  // Cancelar reserva
  const cancelarReserva = (id) => {
    Alert.alert(
      'Confirmar cancelación',
      '¿Estás seguro de que deseas cancelar esta reserva?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: () => handleCancelarReserva(id),
        },
      ]
    );
  };

  const handleCancelarReserva = async (id) => {
    try {
      const response = await fetch(`${RESERVAS_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al cancelar la reserva');
      }

      setReservas((prevReservas) => prevReservas.filter((reserva) => reserva.id !== id));
      Alert.alert('Éxito', 'Reserva cancelada correctamente');
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
      Alert.alert('Error', 'No se pudo cancelar la reserva');
    }
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

  const renderPistaItem = ({ item }) => (
    <View style={[styles.pistaCard, isLargeScreen && styles.pistaCardLarge]}>
      <View style={styles.pistaHeader}>
        <Text style={[styles.pistaNombre, isLargeScreen && styles.pistaNombreLarge]}>{item.nombre}</Text>
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

      <View style={[styles.accionesContainer, isLargeScreen && styles.accionesContainerLarge]}>
        <TouchableOpacity
          style={[styles.botonAccion, isLargeScreen && styles.botonAccionLarge]}
          onPress={() => toggleMantenimiento(item.id)}
        >
          <MaterialIcons
            name={item.enMantenimiento ? 'handyman' : 'construction'}
            size={isLargeScreen ? 24 : 20}
            color={item.enMantenimiento ? '#FFA500' : '#607D8B'}
          />
          <Text style={[styles.textoAccion, isLargeScreen && styles.textoAccionLarge]}>
            {item.enMantenimiento ? 'Reactivar' : 'Mantenimiento'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botonAccion, styles.botonEliminar, isLargeScreen && styles.botonAccionLarge]}
          onPress={() => eliminarPista(item.id)}
        >
          <Ionicons 
            name="trash-outline" 
            size={isLargeScreen ? 24 : 20} 
            color="#F44336" 
          />
          <Text style={[styles.textoAccion, styles.textoEliminar, isLargeScreen && styles.textoAccionLarge]}>
            Eliminar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReservaItem = ({ item }) => (
    <View style={[styles.reservaCard, isLargeScreen && styles.reservaCardLarge]}>
      <View style={styles.reservaHeader}>
        <Text style={[styles.reservaNombrePista, isLargeScreen && styles.reservaNombrePistaLarge]}>
          {item.pistaNombre}
        </Text>
        <Text style={[styles.reservaTipo, isLargeScreen && styles.reservaTipoLarge]}>
          {item.pistaTipo}
        </Text>
      </View>
      
      <View style={styles.reservaInfo}>
        <Text style={[styles.reservaTexto, isLargeScreen && styles.reservaTextoLarge]}>
          Usuario: {item.usuarioNombre}
        </Text>
        <Text style={[styles.reservaTexto, isLargeScreen && styles.reservaTextoLarge]}>
          Fecha: {new Date(item.fecha).toLocaleDateString()}
        </Text>
        <Text style={[styles.reservaTexto, isLargeScreen && styles.reservaTextoLarge]}>
          Hora: {item.horaInicio} - {item.horaFin}
        </Text>
      </View>
      
      <TouchableOpacity
        style={[styles.botonAccion, styles.botonCancelar, isLargeScreen && styles.botonAccionLarge]}
        onPress={() => cancelarReserva(item.id)}
      >
        <Ionicons 
          name="close-circle-outline" 
          size={isLargeScreen ? 24 : 20} 
          color="#F44336" 
        />
        <Text style={[styles.textoAccion, styles.textoEliminar, isLargeScreen && styles.textoAccionLarge]}>
          Cancelar
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={[styles.sectionHeader, isLargeScreen && styles.sectionHeaderLarge]}>
      <Text style={[styles.sectionHeaderText, isLargeScreen && styles.sectionHeaderTextLarge]}>
        {title}
      </Text>
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
      <View style={[styles.header, isLargeScreen && styles.headerLarge]}>
        <Text style={[styles.titulo, isLargeScreen && styles.tituloLarge]}>
          Panel de Administración
        </Text>
        <Text style={[styles.subtitulo, isLargeScreen && styles.subtituloLarge]}>
          Bienvenido, {usuario?.nombre || 'Administrador'}
        </Text>
        
        <View style={[styles.tabsContainer, isLargeScreen && styles.tabsContainerLarge]}>
          <TouchableOpacity
            style={[
              styles.tabButton, 
              activeTab === 'pistas' && styles.activeTab,
              isLargeScreen && styles.tabButtonLarge
            ]}
            onPress={() => setActiveTab('pistas')}
          >
            <Text style={[
              styles.tabText, 
              activeTab === 'pistas' && styles.activeTabText,
              isLargeScreen && styles.tabTextLarge
            ]}>
              Pistas
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tabButton, 
              activeTab === 'reservas' && styles.activeTab,
              isLargeScreen && styles.tabButtonLarge
            ]}
            onPress={() => setActiveTab('reservas')}
          >
            <Text style={[
              styles.tabText, 
              activeTab === 'reservas' && styles.activeTabText,
              isLargeScreen && styles.tabTextLarge
            ]}>
              Reservas
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'pistas' ? (
        <ScrollView 
          style={[styles.scrollContainer, isLargeScreen && styles.scrollContainerLarge]}
          contentContainerStyle={styles.scrollContentContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchData}
            />
          }
        >
          <View style={[styles.formularioContainer, isLargeScreen && styles.formularioContainerLarge]}>
            <Text style={[styles.seccionTitulo, isLargeScreen && styles.seccionTituloLarge]}>
              Agregar Nueva Pista
            </Text>

            <TextInput
              style={[styles.input, isLargeScreen && styles.inputLarge]}
              placeholder="Nombre de la pista"
              value={nuevoNombre}
              onChangeText={text => {
                setNuevoNombre(text);
                setErrorNombreRepetido('');
              }}
              placeholderTextColor="#999"
            />
            {errorNombreRepetido ? (
              <Text style={[styles.errorTexto, isLargeScreen && styles.errorTextoLarge]}>
                {errorNombreRepetido}
              </Text>
            ) : null}

            <DropDownPicker
              open={open}
              value={nuevoTipo}
              items={items}
              setOpen={setOpen}
              setValue={setNuevoTipo}
              setItems={setItems}
              placeholder="Seleccionar tipo"
              style={[styles.dropdown, isLargeScreen && styles.dropdownLarge]}
              dropDownContainerStyle={[styles.dropdownContainer, isLargeScreen && styles.dropdownContainerLarge]}
              zIndex={3000}
              zIndexInverse={1000}
              textStyle={isLargeScreen ? styles.dropdownTextLarge : null}
            />

            <TouchableOpacity
              style={[
                styles.botonAgregar,
                (!nuevoNombre.trim() || !nuevoTipo) && styles.botonDisabled,
                isLargeScreen && styles.botonAgregarLarge
              ]}
              onPress={agregarPista}
              disabled={!nuevoNombre.trim() || !nuevoTipo}
            >
              <Text style={[styles.botonAgregarTexto, isLargeScreen && styles.botonAgregarTextoLarge]}>
                Agregar Pista
              </Text>
              <Ionicons 
                name="add-circle-outline" 
                size={isLargeScreen ? 24 : 20} 
                color="white" 
              />
            </TouchableOpacity>
          </View>

          <View style={[styles.listaContainer, isLargeScreen && styles.listaContainerLarge]}>
            <Text style={[styles.seccionTitulo, isLargeScreen && styles.seccionTituloLarge]}>
              Pistas Disponibles ({pistas.length})
            </Text>

            {pistas.length === 0 ? (
              <Text style={[styles.listaVacia, isLargeScreen && styles.listaVaciaLarge]}>
                No hay pistas registradas
              </Text>
            ) : (
              <SectionList
                sections={sections}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderPistaItem}
                renderSectionHeader={renderSectionHeader}
                stickySectionHeadersEnabled={false}
              />
            )}
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={reservas}
          renderItem={renderReservaItem}
          keyExtractor={(item) => item.id.toString()}
          refreshing={refreshing}
          onRefresh={fetchData}
          ListHeaderComponent={
            <View style={[styles.listaContainer, isLargeScreen && styles.listaContainerLarge]}>
              <Text style={[styles.seccionTitulo, isLargeScreen && styles.seccionTituloLarge]}>
                Reservas Activas ({reservas.length})
              </Text>
            </View>
          }
          ListEmptyComponent={
            <Text style={[styles.listaVacia, isLargeScreen && styles.listaVaciaLarge]}>
              No hay reservas activas
            </Text>
          }
          contentContainerStyle={[
            styles.reservasContentContainer,
            isLargeScreen && styles.reservasContentContainerLarge
          ]}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 16,
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerLarge: {
    paddingVertical: 30,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  tituloLarge: {
    fontSize: 32,
  },
  subtitulo: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 4,
  },
  subtituloLarge: {
    fontSize: 20,
    marginTop: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: '#E1E8ED',
    overflow: 'hidden',
  },
  tabsContainerLarge: {
    marginTop: 24,
    borderRadius: 12,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    flex: 1,
    alignItems: 'center',
  },
  tabButtonLarge: {
    paddingVertical: 14,
  },
  activeTab: {
    backgroundColor: '#3498DB',
  },
  tabText: {
    fontWeight: '600',
    color: '#7F8C8D',
  },
  tabTextLarge: {
    fontSize: 18,
  },
  activeTabText: {
    color: 'white',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContainerLarge: {
    paddingHorizontal: 40,
  },
  scrollContentContainer: {
    paddingBottom: 32,
  },
  formularioContainer: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  formularioContainerLarge: {
    margin: 24,
    padding: 30,
    borderRadius: 18,
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#34495E',
    marginBottom: 16,
  },
  seccionTituloLarge: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    fontSize: 16,
    backgroundColor: '#FDFEFE',
  },
  inputLarge: {
    padding: 18,
    fontSize: 18,
    borderRadius: 12,
  },
  errorTexto: {
    color: '#E74C3C',
    fontWeight: '600',
    marginBottom: 12,
    fontSize: 14,
  },
  errorTextoLarge: {
    fontSize: 16,
  },
  dropdown: {
    borderColor: '#BDC3C7',
    marginBottom: 16,
    borderRadius: 10,
  },
  dropdownLarge: {
    minHeight: 50,
    borderRadius: 12,
  },
  dropdownContainer: {
    borderColor: '#BDC3C7',
    borderRadius: 10,
  },
  dropdownContainerLarge: {
    borderRadius: 12,
  },
  dropdownTextLarge: {
    fontSize: 18,
  },
  botonAgregar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498DB',
    borderRadius: 10,
    padding: 14,
  },
  botonAgregarLarge: {
    padding: 18,
    borderRadius: 12,
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
  botonAgregarTextoLarge: {
    fontSize: 18,
  },
  listaContainer: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  listaContainerLarge: {
    margin: 24,
    padding: 30,
    borderRadius: 18,
  },
  listaVacia: {
    textAlign: 'center',
    color: '#7F8C8D',
    marginVertical: 20,
    fontSize: 16,
  },
  listaVaciaLarge: {
    fontSize: 18,
    marginVertical: 30,
  },
  sectionHeader: {
    backgroundColor: '#F5F7FA',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  sectionHeaderLarge: {
    paddingVertical: 12,
    marginTop: 20,
    marginBottom: 12,
    borderRadius: 12,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  sectionHeaderTextLarge: {
    fontSize: 20,
  },
  pistaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ECF0F1',
  },
  pistaCardLarge: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  pistaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pistaNombre: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
  },
  pistaNombreLarge: {
    fontSize: 20,
  },
  estadoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  estadoIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  estadoTexto: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  accionesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  accionesContainerLarge: {
    marginTop: 16,
  },
  botonAccion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#E1E8ED',
  },
  botonAccionLarge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  botonEliminar: {
    backgroundColor: '#FDECEA',
  },
  botonCancelar: {
    backgroundColor: '#FDECEA',
    alignSelf: 'flex-end',
  },
  textoAccion: {
    marginLeft: 6,
    fontWeight: '600',
    fontSize: 14,
    color: '#34495E',
  },
  textoAccionLarge: {
    fontSize: 16,
  },
  textoEliminar: {
    color: '#E74C3C',
  },
  reservaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ECF0F1',
  },
  reservaCardLarge: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  reservaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reservaNombrePista: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
  },
  reservaNombrePistaLarge: {
    fontSize: 20,
  },
  reservaTipo: {
    fontSize: 12,
    color: '#7F8C8D',
    backgroundColor: '#E1E8ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  reservaTipoLarge: {
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  reservaInfo: {
    marginVertical: 8,
  },
  reservaTexto: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  reservaTextoLarge: {
    fontSize: 16,
  },
  reservasContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  reservasContentContainerLarge: {
    paddingHorizontal: 40,
    alignSelf: 'center',
    width: '80%',
    maxWidth: 800,
  },
});