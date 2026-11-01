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
 * Imprime el contenido de la base de datos.
 */
exports.log = () => {
    const data = db.prepare('SELECT rowid, * FROM users').all();
    console.log(data);
};

/**
 * Comprueba si el nombre de usuario existe en la base de datos.
 *
 * @param {string} username
 * @returns boolean
 */
exports.userExists = (username) => {
    const stmt = db.prepare('SELECT username FROM users WHERE username=?');
    const value = stmt.get(username);
    return Boolean(value);
};

/**
 * Agrega un nuevo usuario en la base de datos.
 * ¡El usuario *no* debe existir!
 *
 * @param {string} username
 * @param {string} email
 * @param {string} hash
 */
exports.addUser = (username, email, hash) => {
    const stmt = db.prepare('INSERT INTO users VALUES (?, ?, ?)');
    stmt.run(username, email, hash);
};

/**
 * Devuelve el hash del usuario.
 *
 * @param {string} username
 * @returns string
 */
exports.getHash = (username) => {
    const stmt = db.prepare('SELECT hash FROM users WHERE username=?');
    return stmt.get(username).hash;
};

/**
 * Devuelve los datos públicos de un usuario y, si existe, su voz.
 *
 * @param {string} username
 * @returns object|null
 */
exports.getUser = (username) => {
    const row = db.prepare(`
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
    `).get(username);

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

/**
 * Actualiza el nombre de usuario y el mail.
 * El cambio de username se propaga a la tabla 'voces' por ON UPDATE CASCADE.
 *
 * @param {string} currentUsername
 * @param {string} newUsername
 * @param {string} email
 */
exports.updateUser = (currentUsername, newUsername, email) => {
    const update = db.transaction(() => {
        db.prepare('UPDATE users SET username = ?, email = ? WHERE username = ?')
            .run(newUsername, email, currentUsername);
    });

    update();
};

/**
 * Devuelve todos los usuarios registrados para el sketch.
 * Los usuarios sin voz también aparecen: su pez nada en blanco y no se pinta.
 *
 * @returns array
 */
exports.getSketchData = () => {
    const rows = db.prepare(`
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
    `).all();

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

/**
 * Crea o actualiza la voz de un usuario.
 * Queda preparado para la etapa de carga de datos.
 *
 * @param {object} voz
 */
exports.upsertVoz = ({ username, frase, color, foto, mostrarEmail }) => {
    const stmt = db.prepare(`
        INSERT INTO voces (username, frase, color, foto, mostrar_email, actualizado_en)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(username) DO UPDATE SET
            frase = excluded.frase,
            color = excluded.color,
            foto = excluded.foto,
            mostrar_email = excluded.mostrar_email,
            actualizado_en = CURRENT_TIMESTAMP
    `);

    stmt.run(username, frase, color, foto, mostrarEmail ? 1 : 0);
};

/**
 * Borra la voz de un usuario. Su pez vuelve a quedar blanco.
 *
 * @param {string} username
 */
exports.deleteVoz = (username) => {
    db.prepare('DELETE FROM voces WHERE username = ?').run(username);
};


// La conexión se cierra automáticamente cuando termina el proceso.
// Evitamos cerrarla desde un handler de salida para no interferir con
// la limpieza interna de better-sqlite3 en versiones recientes de Node.
