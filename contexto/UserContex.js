import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const UserContext = createContext();

// Crea el hook useUser
export const useUser = () => {
  return useContext(UserContext);  // Esto te dará acceso al estado de usuario y las funciones de login/logout
};

export const UserProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const savedUser = await AsyncStorage.getItem('usuario');
      if (savedUser) {
        setUsuario(savedUser);
      }
    };
    loadUser();
  }, []);

  const login = async (usuarioNombre) => {
    setUsuario(usuarioNombre);
    await AsyncStorage.setItem('usuario', usuarioNombre);
  };

  const logout = async () => {
    setUsuario(null);
    await AsyncStorage.removeItem('usuario');
  };

  return (
    <UserContext.Provider value={{ usuario, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
