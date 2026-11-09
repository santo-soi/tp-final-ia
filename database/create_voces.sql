-- Voz de cada usuario. Una voz por persona, relacionada con su pez.
-- La foto es obligatoria según la consigna del proyecto.

CREATE TABLE IF NOT EXISTS voces
(
    username TEXT PRIMARY KEY,
    frase TEXT NOT NULL,
    color TEXT NOT NULL,
    foto TEXT NOT NULL,
    actualizado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE ON UPDATE CASCADE
);
