import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { UserProvider } from './contexto/UserContex';
import AsyncStorage from '@react-native-async-storage/async-storage'; // <-- IMPORTANTE

import Login from './vistas/login';
import Registro from './vistas/registro';
import Inicio from './vistas/inicio';
import Selector from './vistas/selector';
import CrearReserva from './vistas/NuevaReserva';
import AdminPanel from './vistas/admin';
import ResumenReserva from './vistas/ResumenReserva';
import misReservas from './vistas/MisReservas'; // Importa el componente MisReservas

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    const limpiarSesion = async () => {
      try {
        await AsyncStorage.clear(); // Limpia toda la información almacenada
        console.log('AsyncStorage limpiado al iniciar la app');
      } catch (error) {
        console.error('Error al limpiar AsyncStorage:', error);
      }
    };

    limpiarSesion();
  }, []);

  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Inicio"
          screenOptions={{
            headerTitle: '',               
            headerBackTitleVisible: false, 
            headerStyle: {
              backgroundColor: 'transparent',  
              elevation: 0,   
              shadowOpacity: 0, 
            },
            headerTintColor: '#000', 
          }}
        >
          <Stack.Screen 
            name="Inicio" 
            component={Inicio} 
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Registro" component={Registro} />
          <Stack.Screen 
            name="Reservas" 
            component={Selector} 
            options={{ headerShown: false }}
          />
          <Stack.Screen name="CrearReserva" component={CrearReserva} />
          <Stack.Screen name="AdminPanel" component={AdminPanel} />
          <Stack.Screen 
            name="ResumenReserva" 
            component={ResumenReserva}
            options={{
              headerShown: true,
              title: 'Resumen de Reserva',
            }}
          />
          <Stack.Screen 
            name="MisReservas" 
            component={misReservas}
            options={{
              headerShown: true,
              title: 'Mis Reservas',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}
