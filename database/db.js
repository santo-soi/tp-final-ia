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
 * --- PREPARACIÓN DE CONSULTAS ---
 * Al compilar las consultas una sola vez a nivel del módulo,
 * evitamos que el Garbage Collector destruya los objetos en Windows
 * y logramos que las respuestas de la base de datos sean mucho más rápidas.
 */
const stmtLog = db.prepare('SELECT rowid, * FROM users');
const stmtUserExists = db.prepare('SELECT username FROM users WHERE username=?');
const stmtAddUser = db.prepare('INSERT INTO users VALUES (?, ?, ?)');
const stmtGetHash = db.prepare('SELECT hash FROM users WHERE username=?');
const stmtGetUser = db.prepare(`
    SELECT
        u.username,
        u.email,
        v.frase,
        v.color,
        v.foto,
        v.mostrar_email,
        v.actualizado_en
    FROM users u
    LEFT JOIN voces v ON v.username = u.username
    WHERE u.username = ?
`);
const stmtUpdateUser = db.prepare('UPDATE users SET username = ?, email = ? WHERE username = ?');
const stmtGetSketchData = db.prepare(`
    SELECT
        u.username,
        u.email,
        v.frase,
        v.color,
        v.foto,
        v.mostrar_email
    FROM users u
    LEFT JOIN voces v ON v.username = u.username
    ORDER BY u.username COLLATE NOCASE
`);
const stmtUpsertVoz = db.prepare(`
    INSERT INTO voces (username, frase, color, foto, mostrar_email, actualizado_en)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(username) DO UPDATE SET
        frase = excluded.frase,
        color = excluded.color,
        foto = excluded.foto,
        mostrar_email = excluded.mostrar_email,
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

exports.addUser = (username, email, hash) => {
    stmtAddUser.run(username, email, hash);
};

exports.getHash = (username) => {
    return stmtGetHash.get(username).hash;
};

exports.getUser = (username) => {
    const row = stmtGetUser.get(username);

    if (!row) return null;

    return {
        username: row.username,
        email: row.email,
        tieneVoz: Boolean(row.frase),
        frase: row.frase,
        color: row.color,
        foto: row.foto,
        mostrarEmail: Boolean(row.mostrar_email),
        actualizadoEn: row.actualizado_en,
    };
};

exports.updateUser = (currentUsername, newUsername, email) => {
    const update = db.transaction(() => {
        stmtUpdateUser.run(newUsername, email, currentUsername);
    });

    update();
};

exports.getSketchData = () => {
    const rows = stmtGetSketchData.all();

    return rows.map((row) => {
        const tieneVoz = Boolean(row.frase);

        if (!tieneVoz) {
            return {
                username: row.username,
                tieneVoz: false,
            };
        }

        return {
            username: row.username,
            tieneVoz: true,
            frase: row.frase,
            color: row.color,
            foto: row.foto,
            email: row.mostrar_email ? row.email : null,
        };
    });
};

exports.upsertVoz = ({ username, frase, color, foto, mostrarEmail }) => {
    stmtUpsertVoz.run(username, frase, color, foto, mostrarEmail ? 1 : 0);
};

exports.deleteVoz = (username) => {
    stmtDeleteVoz.run(username);
};