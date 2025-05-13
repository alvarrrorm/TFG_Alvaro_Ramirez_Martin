import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { UserProvider } from './contexto/UserContex';
import Login from './vistas/login';
import Registro from './vistas/registro';
import Inicio from './vistas/inicio';
import Reservas from './vistas/reservas';
import NuevaReserva from './vistas/NuevaReserva';
import Admin from './vistas/admin';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <UserProvider>
        <Stack.Navigator initialRouteName="Inicio">
          <Stack.Screen name="Inicio" component={Inicio} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Registro" component={Registro} />
          <Stack.Screen name="Reservas" component={Reservas} />
          <Stack.Screen name="Admin" component={Admin} />
          <Stack.Screen name="NuevaReserva" component={NuevaReserva} />
        </Stack.Navigator>
      </UserProvider>
    </NavigationContainer>
  );
}