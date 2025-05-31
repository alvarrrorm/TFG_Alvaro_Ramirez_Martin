Trabajo fin de grado Álvaro Ramírez Martín
Deppo Gestión de Reservas para Polideportivos (Multiplataforma)

Aplicación móvil y web para reservar pistas deportivas en polideportivos municipales. Desarrollada con **React Native (Expo)** para el frontend y **Node.js + MySQL** para el backend.  


## ✨ Funcionalidades clave
- **Reservas en tiempo real** de pistas (tenis, pádel, fútbol, etc.).
- **Roles de usuarios**: 
  - 👥 Usuarios: Reservan y consultan disponibilidad.
  - 🔑 Administradores: Gestionan pistas y cancelan reservas.
- **Validación segura**: DNI español, encriptación de contraseñas (bcrypt).
- **Multiplataforma**: Funciona en Android y navegadores web.

## 🛠️ Tecnologías utilizadas
| **Frontend**              | **Backend**               | **Base de Datos**       |
|---------------------------|---------------------------|-------------------------|
| React Native (Expo)       | Node.js                   | MySQL                   |
| React Navigation          | Express.js                | Workbench               |
| Axios (HTTP requests)     | Bcrypt (encriptación)     |                         |
| DateTimePicker (fechas)   | JWT (autenticación)       |                         |

## 🚀 Cómo ejecutar el proyecto
### **Prerrequisitos**
- Node.js v18+
- MySQL 8.0+
- Expo CLI instalado (`npm install -g expo-cli`)

### **1. Clonar el repositorio**
```bash
git clone https://github.com/tuusuario/gestion-reservas-polideportivo.git
cd gestion-reservas-polideportivo
