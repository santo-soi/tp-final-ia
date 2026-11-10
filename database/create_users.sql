-- Crear la tabla para usuario si no existe en la base de datos.
-- La foto de perfil vive acá porque puede existir aunque el usuario todavía no tenga voz.

CREATE TABLE IF NOT EXISTS users
(
    username varchar(255) NOT NULL UNIQUE,
    hash varchar(255) NOT NULL,
    foto TEXT
)
