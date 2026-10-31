-- Crear la tabla para usuario si no existe en la base de datos.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users
(
    username varchar(255) PRIMARY KEY,
    email varchar(255) NOT NULL,
    hash varchar(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_images
(
    username varchar(255) NOT NULL,
    filehash varchar(255) NOT NULL UNIQUE,
    filename varchar(255),
    filedesc varchar(255),
    FOREIGN KEY(username) REFERENCES users(username) ON DELETE CASCADE
);