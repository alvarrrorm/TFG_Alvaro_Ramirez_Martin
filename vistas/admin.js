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
  LayoutAnimation
} from 'react-native';
import { useUser } from '../contexto/UserContex';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function AdminPanel({ navigation }) {
  const { usuario, logout } = useUser();
  const [pistas, setPistas] = useState([]);
  const [reservas, setReservas] = useState([]);
  const { width, height } = useWindowDimensions();
  
  const isSmallScreen = width < 600;
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [layoutHeight, setLayoutHeight] = useState(0);

  // Configuración del scroll indicator
  const progressBarWidth = scrollY.interpolate({
    inputRange: [0, Math.max(contentHeight - layoutHeight, 1)],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp'
  });

  const [showProgressBar, setShowProgressBar] = useState(false);

  useEffect(() => {
    // Datos de ejemplo
    setPistas([
      { id: 1, nombre: 'Pista Central', enMantenimiento: false, tipo: 'Tierra batida' },
      { id: 2, nombre: 'Pista Cubierta', enMantenimiento: false, tipo: 'Dura' },
      { id: 3, nombre: 'Pista Norte', enMantenimiento: true, tipo: 'Hierba' },
    ]);

    setReservas([
      { id: 1, usuario: 'Juan Pérez', pista: 'Pista Central', fecha: '2025-05-12 10:00', estado: 'confirmada' },
      { id: 2, usuario: 'Ana López', pista: 'Pista Cubierta', fecha: '2025-05-13 14:00', estado: 'pendiente' },
      { id: 3, usuario: 'Carlos Ruiz', pista: 'Pista Norte', fecha: '2025-05-14 16:30', estado: 'cancelada' },
    ]);

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } }}],
    {
      useNativeDriver: false,
      listener: (event) => {
        const currentScroll = event.nativeEvent.contentOffset.y;
        setShowProgressBar(currentScroll > 10);
      }
    }
  );

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
      
      <View style={styles.buttonGroup}>
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
            {item.enMantenimiento ? 'Lista para usar' : 'Mantenimiento'}
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
    <View style={styles.reservaItem}>
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
        <Ionicons name="tennisball" size={14} color="#4F46E5" /> {item.pista}
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
      {/* Barra de progreso del scroll */}
      {contentHeight > layoutHeight && (
        <Animated.View style={[
          styles.progressBarContainer,
          { opacity: showProgressBar ? 1 : 0 }
        ]}>
          <Animated.View 
            style={[
              styles.progressBar,
              { width: progressBarWidth }
            ]} 
          />
        </Animated.View>
      )}

      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onContentSizeChange={(w, h) => setContentHeight(h)}
        onLayout={({ nativeEvent }) => setLayoutHeight(nativeEvent.layout.height)}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Panel de Administración</Text>
            <View style={styles.userContainer}>
              <Ionicons name="person-circle" size={24} color="#4F46E5" />
              <Text style={styles.username}>{usuario.nombre}</Text>
            </View>
          </View>

          {/* Estadísticas */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{pistas.length}</Text>
              <Text style={styles.statLabel}>Pistas</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{reservas.length}</Text>
              <Text style={styles.statLabel}>Reservas</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {pistas.filter(p => p.enMantenimiento).length}
              </Text>
              <Text style={styles.statLabel}>En mantenimiento</Text>
            </View>
          </View>

          {/* Gestión de Pistas */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Gestión de Pistas</Text>
              <TouchableOpacity onPress={agregarPista} style={styles.addButton}>
                <Ionicons name="add" size={20} color="white" />
              </TouchableOpacity>
            </View>
            
            {pistas.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="sports-tennis" size={40} color="#9CA3AF" />
                <Text style={styles.emptyText}>No hay pistas registradas</Text>
              </View>
            ) : (
              <View style={styles.itemsContainer}>
                {pistas.map((item) => (
                  <View key={item.id.toString()} style={styles.itemWrapper}>
                    {renderPistaItem({ item })}
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Reservas Recientes */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Reservas Recientes</Text>
            </View>
            
            {reservas.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="event-note" size={40} color="#9CA3AF" />
                <Text style={styles.emptyText}>No hay reservas recientes</Text>
              </View>
            ) : (
              <View style={styles.itemsContainer}>
                {reservas.map((item) => (
                  <View key={item.id.toString()} style={styles.itemWrapper}>
                    {renderReservaItem({ item })}
                  </View>
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Ionicons name="log-out" size={20} color="white" />
            <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Contenedores principales
  flexContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    paddingHorizontal: 25,
    paddingBottom: 30,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30
  },

  // Barra de progreso
  progressBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(200, 200, 200, 0.2)',
    zIndex: 1000,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 2,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    paddingTop: 20,
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
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 100,
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
  },

  // Secciones
  section: {
    marginBottom: 30,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingVertical: 10,
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
    shadowOpacity: 0.1,
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