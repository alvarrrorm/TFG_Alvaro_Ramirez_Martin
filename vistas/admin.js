import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  useWindowDimensions,
  ScrollView,
  SafeAreaView,
  Animated,
  Platform
} from 'react-native';
import { useUser } from '../contexto/UserContex';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function AdminPanel({ navigation }) {
  const { usuario, logout } = useUser();
  const [pistas, setPistas] = useState([]);
  const [reservas, setReservas] = useState([]);
  const { width } = useWindowDimensions();

  const isWeb = width >= 768;
  const scrollY = useRef(new Animated.Value(0)).current;
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  useEffect(() => {
    // Datos de ejemplo
    setPistas([
      { id: 1, nombre: 'Pista Central', enMantenimiento: false, tipo: 'Tierra batida' },
      { id: 2, nombre: 'Pista Cubierta', enMantenimiento: false, tipo: 'Dura' },
      { id: 3, nombre: 'Pista Norte', enMantenimiento: true, tipo: 'Hierba' },
      { id: 4, nombre: 'Pista Sur', enMantenimiento: false, tipo: 'Tierra batida' },
      { id: 5, nombre: 'Pista Este', enMantenimiento: false, tipo: 'Dura' },
    ]);

    setReservas([
      { id: 1, usuario: 'Juan Pérez', pista: 'Pista Central', fecha: '2025-05-12 10:00', estado: 'confirmada' },
      { id: 2, usuario: 'Ana López', pista: 'Pista Cubierta', fecha: '2025-05-13 14:00', estado: 'pendiente' },
      { id: 3, usuario: 'Carlos Ruiz', pista: 'Pista Norte', fecha: '2025-05-14 16:30', estado: 'cancelada' },
      { id: 4, usuario: 'María García', pista: 'Pista Sur', fecha: '2025-05-15 11:00', estado: 'confirmada' },
    ]);
  }, []);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  const onContentSizeChange = (contentWidth, contentHeight) => {
    // Mostrar indicador de scroll solo si el contenido es más alto que la pantalla
    setShowScrollIndicator(contentHeight > width * 0.8); // Ajuste para web
  };

  const marcarMantenimiento = (id) => {
    const updatedPistas = pistas.map(pista =>
      pista.id === id ? { ...pista, enMantenimiento: !pista.enMantenimiento } : pista
    );
    setPistas(updatedPistas);
  };

  const eliminarPista = (id) => {
    Alert.alert(
      'Eliminar pista',
      '¿Estás seguro de que deseas eliminar esta pista?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            const updatedPistas = pistas.filter(pista => pista.id !== id);
            setPistas(updatedPistas);
          }
        },
      ]
    );
  };

  const verDetallesReserva = (reserva) => {
    Alert.alert(
      `Detalles de reserva #${reserva.id}`,
      `👤 Usuario: ${reserva.usuario}\n🎾 Pista: ${reserva.pista}\n📅 Fecha: ${reserva.fecha}\n📌 Estado: ${reserva.estado}`,
      [{ text: 'Cerrar' }]
    );
  };

  const agregarPista = () => {
    const nuevaId = pistas.length > 0 ? Math.max(...pistas.map(p => p.id)) + 1 : 1;
    const nuevaPista = {
      id: nuevaId,
      nombre: `Pista ${nuevaId}`,
      enMantenimiento: false,
      tipo: ['Tierra batida', 'Dura', 'Hierba'][Math.floor(Math.random() * 3)]
    };
    setPistas([...pistas, nuevaPista]);
  };

  const renderPistaItem = ({ item }) => (
    <View style={[
      styles.item,
      isWeb ? styles.webItem : styles.mobileItem,
      item.enMantenimiento && styles.maintenanceItem
    ]}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemName}>{item.nombre}</Text>
        {item.enMantenimiento && (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Mantenimiento</Text>
          </View>
        )}
      </View>
      <Text style={styles.itemDetail}>Tipo: {item.tipo}</Text>

      <View style={[styles.buttonGroup, isWeb && styles.webButtonGroup]}>
        <TouchableOpacity
          onPress={() => marcarMantenimiento(item.id)}
          style={[
            styles.actionButton,
            item.enMantenimiento ? styles.successButton : styles.warningButton
          ]}
        >
          <Ionicons
            name={item.enMantenimiento ? "checkmark-circle" : "construct"}
            size={16}
            color="white"
          />
          <Text style={styles.actionButtonText}>
            {item.enMantenimiento ? 'Lista' : 'Mantenimiento'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => eliminarPista(item.id)}
          style={[styles.actionButton, styles.dangerButton]}
        >
          <Ionicons name="trash" size={16} color="white" />
          <Text style={styles.actionButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReservaItem = ({ item }) => (
    <View style={[styles.reservaItem, isWeb ? styles.webReservaItem : styles.mobileReservaItem]}>
      <View style={styles.reservaHeader}>
        <Text style={styles.reservaUsuario}>{item.usuario}</Text>
        <View style={[
          styles.reservaEstado,
          item.estado === 'confirmada' && styles.estadoConfirmada,
          item.estado === 'cancelada' && styles.estadoCancelada
        ]}>
          <Text style={styles.reservaEstadoText}>{item.estado}</Text>
        </View>
      </View>
      <Text style={styles.reservaDetalle}>
        <Ionicons name="basketball" size={14} color="#4F46E5" /> {item.pista}
      </Text>
      <Text style={styles.reservaDetalle}>
        <Ionicons name="calendar" size={14} color="#4F46E5" /> {item.fecha}
      </Text>
      <TouchableOpacity
        onPress={() => verDetallesReserva(item)}
        style={styles.detalleButton}
      >
        <Text style={styles.detalleButtonText}>Ver detalles completos</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.flexContainer}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, isWeb && styles.webScrollContent]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onContentSizeChange={onContentSizeChange}
        showsVerticalScrollIndicator={showScrollIndicator}
      >
        <View style={[styles.container, isWeb && styles.webContainer]}>
          {/* Header */}
          <View style={[styles.header, isWeb && styles.webHeader]}>
            <Text style={styles.title}>Panel de Administración</Text>
            <View style={styles.userContainer}>
             
              <Text style={styles.username}>{usuario.nombre}</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Reservas')}
                style={[styles.logoutButton, isWeb && styles.webLogoutButton]}
              >
                <Ionicons name="log-out" size={16} color="white" />
                {isWeb && <Text style={styles.logoutButtonText}>Ir a reservas</Text>}
              </TouchableOpacity>

            </View>
          </View>

          {/* Estadísticas */}
          <View style={[styles.statsContainer, isWeb && styles.webStatsContainer]}>
            <View style={[styles.statCard, isWeb && styles.webStatCard]}>
              <Text style={styles.statNumber}>{pistas.length}</Text>
              <Text style={styles.statLabel}>Pistas</Text>
            </View>
            <View style={[styles.statCard, isWeb && styles.webStatCard]}>
              <Text style={styles.statNumber}>{reservas.length}</Text>
              <Text style={styles.statLabel}>Reservas</Text>
            </View>
            <View style={[styles.statCard, isWeb && styles.webStatCard]}>
              <Text style={styles.statNumber}>
                {pistas.filter(p => p.enMantenimiento).length}
              </Text>
              <Text style={styles.statLabel}>En mantenimiento</Text>
            </View>
            {isWeb && (
              <View style={[styles.statCard, styles.webStatCard]}>
                <Text style={styles.statNumber}>
                  {reservas.filter(r => r.estado === 'confirmada').length}
                </Text>
                <Text style={styles.statLabel}>Reservas confirmadas</Text>
              </View>
            )}
          </View>

          {/* Contenido principal en columnas para web */}
          <View style={isWeb ? styles.webMainContent : null}>
            {/* Gestión de Pistas */}
            <View style={[styles.section, isWeb && styles.webSection]}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Gestión de Pistas</Text>
                <TouchableOpacity onPress={agregarPista} style={styles.addButton}>
                  <Ionicons name="add" size={20} color="white" />
                  {isWeb && <Text style={styles.addButtonText}>Añadir pista</Text>}
                </TouchableOpacity>
              </View>

              {pistas.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialIcons name="sports-tennis" size={40} color="#9CA3AF" />
                  <Text style={styles.emptyText}>No hay pistas registradas</Text>
                </View>
              ) : (
                <View style={[styles.itemsContainer, isWeb && styles.webItemsContainer]}>
                  {pistas.map((item) => (
                    <View key={item.id.toString()} style={styles.itemWrapper}>
                      {renderPistaItem({ item })}
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Reservas Recientes */}
            <View style={[styles.section, isWeb && styles.webSection]}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Reservas Recientes</Text>
                {isWeb && (
                  <TouchableOpacity style={styles.viewAllButton}>
                    <Text style={styles.viewAllButtonText}>Ver todas</Text>
                  </TouchableOpacity>
                )}
              </View>

              {reservas.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialIcons name="event-note" size={40} color="#9CA3AF" />
                  <Text style={styles.emptyText}>No hay reservas recientes</Text>
                </View>
              ) : (
                <View style={[styles.itemsContainer, isWeb && styles.webItemsContainer]}>
                  {reservas.map((item) => (
                    <View key={item.id.toString()} style={styles.itemWrapper}>
                      {renderReservaItem({ item })}
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {!isWeb && (
            <TouchableOpacity onPress={logout} style={styles.logoutButton}>
              <Ionicons name="log-out" size={20} color="white" />
              <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Estilos base
  flexContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  // Estilos para web
  webContainer: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  webScrollContent: {
    paddingBottom: 40,
  },
  webHeader: {
    marginBottom: 32,
  },
  webMainContent: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'flex-start',
  },
  webSection: {
    flex: 1,
    marginBottom: 0,
  },
  webStatsContainer: {
    flexWrap: 'wrap',
    gap: 16,
  },
  webStatCard: {
    flex: 1,
    minWidth: 180,
  },
  webItemsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 16,
  },
  webItem: {
    minHeight: 180,
  },
  webReservaItem: {
    minHeight: 160,
  },
  webButtonGroup: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  webLogoutButton: {
    paddingHorizontal: 12,
    marginLeft: 16,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
  },

  // Estadísticas
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },

  // Secciones
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },

  // Botones
  addButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  viewAllButton: {
    padding: 8,
  },
  viewAllButtonText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '500',
  },

  // Items
  itemsContainer: {
    gap: 12,
  },
  itemWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },

  // Item Pista
  item: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  mobileItem: {
    marginBottom: 8,
  },
  maintenanceItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
  },
  itemDetail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },

  // Botones de acción
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  warningButton: {
    backgroundColor: '#F59E0B',
  },
  successButton: {
    backgroundColor: '#10B981',
  },
  dangerButton: {
    backgroundColor: '#EF4444',
  },

  // Item Reserva
  reservaItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  mobileReservaItem: {
    marginBottom: 8,
  },
  reservaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reservaUsuario: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  reservaEstado: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  reservaEstadoText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  estadoConfirmada: {
    backgroundColor: '#D1FAE5',
  },
  estadoCancelada: {
    backgroundColor: '#FEE2E2',
  },
  reservaDetalle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
  },
  detalleButton: {
    marginTop: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  detalleButtonText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '500',
  },

  // Estados vacíos
  emptyState: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  emptyText: {
    marginTop: 12,
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
  },

  // Botón de logout
  logoutButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});