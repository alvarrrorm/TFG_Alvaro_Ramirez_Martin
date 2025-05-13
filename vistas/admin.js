import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView,
  FlatList,
  Dimensions,
  useWindowDimensions
} from 'react-native';
import { useUser } from '../contexto/UserContex';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function AdminPanel({ navigation }) {
  const { usuario, logout } = useUser();
  const [pistas, setPistas] = useState([]);
  const [reservas, setReservas] = useState([]);
  const { width } = useWindowDimensions();
  
  // Determinar si estamos en pantalla pequeña
  const isSmallScreen = width < 600;

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
  }, []);

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

  // Estilos dinámicos basados en el tamaño de pantalla
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      padding: isSmallScreen ? 15 : 25,
      backgroundColor: '#F9FAFB',
    },
    statsContainer: {
      flexDirection: isSmallScreen ? 'column' : 'row',
      marginBottom: 25,
      gap: 12,
    },
    statCard: {
      flex: 1,
      minWidth: isSmallScreen ? '100%' : undefined,
    },
    buttonGroup: {
      flexDirection: isSmallScreen ? 'column' : 'row',
      gap: 8,
    },
    actionButton: {
      width: isSmallScreen ? '100%' : undefined,
    },
    sectionTitle: {
      fontSize: isSmallScreen ? 18 : 20,
    },
  });

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
      
      <View style={dynamicStyles.buttonGroup}>
        <TouchableOpacity 
          onPress={() => marcarMantenimiento(item.id)} 
          style={[
            styles.actionButton,
            dynamicStyles.actionButton,
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
          style={[styles.actionButton, dynamicStyles.actionButton, styles.dangerButton]}
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
    <ScrollView 
      style={dynamicStyles.container}
      contentContainerStyle={{ paddingBottom: 50 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Panel de Administración</Text>
        <View style={styles.userContainer}>
          <Ionicons name="person-circle" size={24} color="#4F46E5" />
          <Text style={styles.username}>{usuario.nombre}</Text>
        </View>
      </View>

      <View style={dynamicStyles.statsContainer}>
        <View style={[styles.statCard, dynamicStyles.statCard]}>
          <Text style={styles.statNumber}>{pistas.length}</Text>
          <Text style={styles.statLabel}>Pistas</Text>
        </View>
        <View style={[styles.statCard, dynamicStyles.statCard]}>
          <Text style={styles.statNumber}>{reservas.length}</Text>
          <Text style={styles.statLabel}>Reservas</Text>
        </View>
        <View style={[styles.statCard, dynamicStyles.statCard]}>
          <Text style={styles.statNumber}>
            {pistas.filter(p => p.enMantenimiento).length}
          </Text>
          <Text style={styles.statLabel}>En mantenimiento</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={dynamicStyles.sectionTitle}>Gestión de Pistas</Text>
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
          <FlatList
            data={pistas}
            scrollEnabled={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderPistaItem}
            contentContainerStyle={{ gap: 12 }}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={dynamicStyles.sectionTitle}>Reservas Recientes</Text>
        
        {reservas.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="event-note" size={40} color="#9CA3AF" />
            <Text style={styles.emptyText}>No hay reservas recientes</Text>
          </View>
        ) : (
          <FlatList
            data={reservas}
            scrollEnabled={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderReservaItem}
            contentContainerStyle={{ gap: 12 }}
          />
        )}
      </View>

      <TouchableOpacity onPress={logout} style={styles.logoutButton}>
        <Ionicons name="log-out" size={20} color="white" />
        <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Estilos base (sin cambios)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
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
    fontWeight: '600',
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: '#4F46E5',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
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
  buttonGroup: {
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
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
  reservaItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
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
  emptyState: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 8,
    color: '#9CA3AF',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 30,
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