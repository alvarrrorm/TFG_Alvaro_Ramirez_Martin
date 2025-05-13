import React, { useState } from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Login from './vistas/login';
import Registro from './vistas/registro';
import Inicio from './vistas/inicio';
import Reservas from './vistas/reservas';
import NuevaReserva from './vistas/NuevaReserva';
import { UserContext } from './contexto/UserContex'; 

const Stack = createStackNavigator();

export default function App() {
  const [usuario, setUsuario] = useState(null);

  return (
    <NavigationContainer>
    <UserContext.Provider value={{ usuario, setUsuario }}>
      
        <Stack.Navigator initialRouteName="Inicio">
          <Stack.Screen name="Inicio" component={Inicio} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Registro" component={Registro} />
          <Stack.Screen name="Reservas" component={Reservas} />
          <Stack.Screen name="NuevaReserva" component={NuevaReserva} />
        </Stack.Navigator>
      
    </UserContext.Provider>
    </NavigationContainer>
  );
}
