/*create database gestion_polideportivo;*/
use gestion_polideportivo;
/*
create table pistas (
id int Auto_increment primary key,
nombre varchar(100) not null,
tipo varchar (50),
disponible boolean default true);
*/

/*
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dni VARCHAR(20) NOT NULL UNIQUE,
  nombre VARCHAR(50) NOT NULL,
  correo VARCHAR(100) NOT NULL,
  usuario VARCHAR(100) NOT NULL UNIQUE,
  pass VARCHAR(255) NOT NULL,
  rol VARCHAR(20) DEFAULT 'usuario'
);

/*
    CREATE TABLE reservas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dni_usuario VARCHAR(20) NOT NULL,
  id_polideportivo INT NOT NULL,
  pista varchar(20),
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  estado VARCHAR(20) DEFAULT 'pendiente',
  FOREIGN KEY (dni_usuario) REFERENCES usuarios(dni),
  FOREIGN KEY (id_polideportivo) REFERENCES polideportivo(id)
);
*/


    