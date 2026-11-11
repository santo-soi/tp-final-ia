-- Voz de cada usuario. Una voz por persona, relacionada con su pez.
-- La foto de perfil vive en la tabla users; acá se guardan la frase y el color.

CREATE TABLE IF NOT EXISTS voces
(
    username TEXT PRIMARY KEY,
    frase TEXT NOT NULL,
    color TEXT NOT NULL,
    actualizado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE ON UPDATE CASCADE
);
