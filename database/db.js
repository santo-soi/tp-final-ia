// Importa el módulo better-sqlite3.
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Abre/crea una base de datos en disco rígido.
const db = new Database('users.db', { verbose: console.log });

// Carga el script sql para crear la tabla users.
const filePath = path.join(__dirname, 'create_users.sql');
const file = fs.readFileSync(filePath, 'utf-8');

// Crea la tabla si no existe, `exec` es lo mismo que `run` pero se usa para hacer varias cosas de uan.
db.exec(file);


/**
 * Imprime el contenido de la base de datos.
 */
exports.log = () => {
    let data = db.prepare('SELECT rowid, * FROM users').all();
    console.log('Tabla users', data);
    data = db.prepare('SELECT rowid, * FROM user_images').all();
    console.log('Tabla user_images:', data);
};

/**
 * Comprueba si el nombre de usuario existe en la base de datos.
 *
 * @param {string} username
 * @returns boolean
 */
exports.userExists = (username) => {
    let stmt = db.prepare('SELECT username FROM users WHERE username=?');
    let value = stmt.get(username);
    if(!value) return false;
    else return true;
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
    stmt = db.prepare("INSERT INTO users VALUES (?, ?, ?)");
    stmt.run(username, email, hash);
}

/**
 * Devuelve el hash del usuario.
 *
 * @param {string} username
 * @returns boolean
 */
exports.getHash = (username) => {
    let stmt = db.prepare('SELECT hash FROM users WHERE username=?');
    return stmt.get(username).hash;
}


/**
 * Agrega la ruta de una imagen a la tabla de imágenes
 * junto con el usuario al que pertenece.
 *
 * @param {string} username
 * @param {string} path
 */
exports.addUserImage = (username, path, filename, filedesc) => {
    let stmt = db.prepare('INSERT INTO user_images VALUES(?, ?, ?, ?)');
    stmt.run(username, path, filename, filedesc);
}

/**
 * Comprueba la imagen existe en la base de datos para el usuario.
 *
 * @param {string} username
 * @returns boolean
 */
exports.userImagenExists = (username, path) => {
    let stmt = db.prepare('SELECT filehash FROM user_images WHERE username=? AND filehash=?');
    let value = stmt.get(username, path);
    if(!value) return false;
    else return true;
};

/**
 * Borra una de las imágenes del usuario.
 * ¡EL ARCHIVO REAL HAY QUE BORRARLO A PARTE CON fs o manualmente!
 *
 * @param {string} username
 * @param {string} path
 */
exports.deleteUserImage = (username, path) => {
    let stmt = db.prepare('DELETE FROM user_images WHERE username=? AND filehash=?');
    stmt.run(username, path);
}

/**
 * Retorna un array con las rutas de todas
 * las imágenes del usuario.
 *
 * @param {string} username
 * @returns array
 */
exports.getAllUserImages = (username) => {
    let stmt = db.prepare('SELECT filehash FROM user_images WHERE username=?');
    return stmt.all(username);
}

/**
 * Retorna un array con los datos de las
 * imágenes y los/as usuarios/as a los que corresponden.
 * Son todas las entradas de la tabla de imágenes.
 *
 * @returns array
 */
exports.getSketchData = () => {
    let stmt = db.prepare('SELECT * FROM user_images');
    return stmt.all();
}


// Siempre cerrar la conexión, apagar, al terminar.
// ste código sirve luego para el servidor express.
process.on('exit', () => db.close());
process.on('SIGHUP', () => process.exit()); // Cierre de la terminal.
process.on('SIGINT', () => process.exit()); // Ctrl-C.
process.on('SIGTERM', () => process.exit()); // Ctrl-D.
