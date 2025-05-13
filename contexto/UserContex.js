import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const UserContext = createContext();

// Crea el hook useUser
export const useUser = () => {
  return useContext(UserContext); 
};

export const UserProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);  // Información del usuario (nombre y dni)
  const [dni, setDni] = useState(null);  // Almacenamos el DNI aparte

  useEffect(() => {
    const loadUser = async () => {
      const savedUser = await AsyncStorage.getItem('usuario');
      const savedDni = await AsyncStorage.getItem('dni');
      if (savedUser && savedDni) {
        setUsuario(savedUser);
        setDni(savedDni);
      }
    };
    loadUser();
  }, []);

  // Función para hacer login, almacenando nombre y dni
  const login = async (usuarioNombre, usuarioDni) => {
    setUsuario(usuarioNombre);
    setDni(usuarioDni);
    await AsyncStorage.setItem('usuario', usuarioNombre);
    await AsyncStorage.setItem('dni', usuarioDni);
  };

  // Función para hacer logout, eliminando nombre y dni
  const logout = async () => {
    setUsuario(null);
    setDni(null);
    await AsyncStorage.removeItem('usuario');
    await AsyncStorage.removeItem('dni');
  };

  return (
    <UserContext.Provider value={{ usuario, dni, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
