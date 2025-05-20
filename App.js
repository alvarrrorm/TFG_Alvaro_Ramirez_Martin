import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { UserProvider } from './contexto/UserContex';
import Login from './vistas/login';
import Registro from './vistas/registro';
import Inicio from './vistas/inicio';
import Reservas from './vistas/reservas';
import NuevaReserva from './vistas/NuevaReserva';
import AdminPanel from './vistas/admin';

const Stack = createStackNavigator();

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Inicio">
          <Stack.Screen name="Inicio" component={Inicio} options={{ headerShown: false }}
          />

          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }}
          />
          <Stack.Screen name="Registro" component={Registro} options={{ headerShown: false }}
          />
          <Stack.Screen name="Reservas" component={Reservas} options={{headerShown: false}} />
          <Stack.Screen name="NuevaReserva" component={NuevaReserva} />
          <Stack.Screen
            name="AdminPanel"
            component={AdminPanel}
            options={{ title: 'Panel de Administración' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}
