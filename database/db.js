// Importa el módulo better-sqlite3.
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Abre/crea una base de datos en disco rígido.
const db = new Database('users.db', { verbose: console.log });

// Activa las claves foráneas para que las relaciones entre tablas se respeten.
db.pragma('foreign_keys = ON');

// Carga los scripts SQL de la carpeta 'database'.
const usersSchema = fs.readFileSync(path.join(__dirname, 'create_users.sql'), 'utf-8');
const vocesSchema = fs.readFileSync(path.join(__dirname, 'create_voces.sql'), 'utf-8');

// Crea las tablas si no existen.
db.exec(usersSchema);
db.exec(vocesSchema);


/**
 * --- MIGRACIONES ---
 * Las bases creadas con el esquema anterior guardaban la foto en 'voces'
 * y no tenían la columna 'foto' en 'users'. Si se detecta ese esquema,
 * la foto se mueve al perfil (existe aunque el usuario no tenga voz)
 * y 'voces' se regenera conservando solo frase y color.
 */

const columnasUsers = db.pragma('table_info(users)');
if (!columnasUsers.some((columna) => columna.name === 'foto')) {
    db.exec('ALTER TABLE users ADD COLUMN foto TEXT');
}

const columnasVoces = db.pragma('table_info(voces)');
if (columnasVoces.some((columna) => columna.name === 'foto')) {
    // 1. Mover la foto guardada en 'voces' al perfil del usuario.
    db.exec(`
        UPDATE users
        SET foto = (SELECT v.foto FROM voces v WHERE v.username = users.username)
        WHERE foto IS NULL
    `);

    // 2. Regenerar 'voces' sin la columna 'foto', preservando las voces.
    db.exec(`
        CREATE TABLE voces_sin_foto (
            username TEXT PRIMARY KEY,
            frase TEXT NOT NULL,
            color TEXT NOT NULL,
            actualizado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE ON UPDATE CASCADE
        )
    `);
    db.exec(`
        INSERT INTO voces_sin_foto (username, frase, color, actualizado_en)
        SELECT username, frase, color, actualizado_en FROM voces
    `);
    db.exec('DROP TABLE voces');
    db.exec('ALTER TABLE voces_sin_foto RENAME TO voces');
}


/**
 * --- PREPARACIÓN DE CONSULTAS ---
 * Al compilar las consultas una sola vez a nivel del módulo,
 * evitamos que el Garbage Collector destruya los objetos en Windows
 * y logramos que las respuestas de la base de datos sean mucho más rápidas.
 */
const stmtLog = db.prepare('SELECT rowid, * FROM users');
const stmtUserExists = db.prepare('SELECT username FROM users WHERE username=?');
const stmtAddUser = db.prepare('INSERT INTO users (username, hash) VALUES (?, ?)');
const stmtGetHash = db.prepare('SELECT hash FROM users WHERE username=?');
const stmtGetUser = db.prepare(`
    SELECT
        u.username,
        u.foto,
        v.frase,
        v.color,
        v.actualizado_en
    FROM users u
    LEFT JOIN voces v ON v.username = u.username
    WHERE u.username = ?
`);
const stmtUpdateUsername = db.prepare('UPDATE users SET username = ? WHERE username = ?');
const stmtUpdatePassword = db.prepare('UPDATE users SET hash = ? WHERE username = ?');
const stmtUpdateFoto = db.prepare('UPDATE users SET foto = ? WHERE username = ?');
const stmtGetSketchData = db.prepare(`
    SELECT
        u.username,
        u.foto,
        v.frase,
        v.color
    FROM users u
    LEFT JOIN voces v ON v.username = u.username
    ORDER BY u.username COLLATE NOCASE
`);
const stmtUpsertVoz = db.prepare(`
    INSERT INTO voces (username, frase, color, actualizado_en)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(username) DO UPDATE SET
        frase = excluded.frase,
        color = excluded.color,
        actualizado_en = CURRENT_TIMESTAMP
`);
const stmtDeleteVoz = db.prepare('DELETE FROM voces WHERE username = ?');


/**
 * --- FUNCIONES EXPORTADAS ---
 */

exports.log = () => {
    const data = stmtLog.all();
    console.log(data);
};

exports.userExists = (username) => {
    const value = stmtUserExists.get(username);
    return Boolean(value);
};

exports.addUser = (username, hash) => {
    stmtAddUser.run(username, hash);
};

exports.getHash = (username) => {
    return stmtGetHash.get(username).hash;
};

exports.getUser = (username) => {
    const row = stmtGetUser.get(username);
    if (!row) return null;
    return {
        username: row.username,
        foto: row.foto,
        tieneVoz: Boolean(row.frase),
        frase: row.frase,
        color: row.color,
        actualizadoEn: row.actualizado_en,
    };
};

exports.updateUsername = (currentUsername, newUsername) => {
    stmtUpdateUsername.run(newUsername, currentUsername);
};

exports.updatePassword = (username, newHash) => {
    stmtUpdatePassword.run(newHash, username);
};

// Guarda la ruta pública de la foto de perfil (ej: '/uploads/abc123.jpg').
exports.updateFoto = (username, foto) => {
    stmtUpdateFoto.run(foto, username);
};

// Datos que la obra necesita: un registro por usuario registrado,
// con su foto de perfil y (si la cargó) su voz.
exports.getSketchData = () => {
    return stmtGetSketchData.all().map((row) => ({
        username: row.username,
        foto: row.foto,
        tieneVoz: Boolean(row.frase),
        frase: row.frase || null,
        color: row.color || null,
    }));
};

exports.upsertVoz = ({ username, frase, color }) => {
    stmtUpsertVoz.run(username, frase, color);
};

exports.deleteVoz = (username) => {
    stmtDeleteVoz.run(username);
};
