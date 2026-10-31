/**
 * Este es el archivo principal de la aplicación servidor.
 */

// Imports de commonjs.
const express = require('express');
const session = require('express-session');

// Enrutadores de la carpeta '/routes'.
const indexRouter = require('./routes/index.js');
const userRouter = require('./routes/user.js');
const obraRouter = require('./routes/obra.js');

// Define el puerto en una constante, la manera correcta es usar variables de entorno pero no lo vamos a hacer así.
const PORT = 3000;
// Crea el objeto de la aplicación.
const app = express();


/**
 * Configuración de los valores de la aplicación.
 */

app.set('port', PORT);

app.set('views', './views');
app.set('view engine', 'ejs');


/**
 * Configuración del middleware.
 */

// Agrega el middleware global (de aplicación).
app.use(express.urlencoded({ extended: true }));  // Procesa los datos de las peticiones POST y los pone disponibles en `req.body`.


// Middleware global de sesión.
app.use(session({
    resave: false, // No guarda el objeto en el almacén de sesiones si este no fue modificado durante el procesamiento de la petición.
    saveUninitialized: false, // No guardar sesiones no inicializadas (nuevas y no modificadas) en el almacén.
    secret: 'clave secreta en el servidor'  // Clave de cifrado para firmar el ID de la sesión.
}));


// Recursos púbicos. Puede contener hojas de estilo,
// imágenes o sripts del lado del cliente para el sitio.
app.use('/public', express.static('public'));
// Recursos públicos: endpoint de acceso, ruta a la carpeta compartida.
app.use('/uploads', express.static('uploads'));


/**
 * Configuración de los enrutadores.
 */

app.use("/", indexRouter);
app.use("/user", userRouter);
app.use("/obra", obraRouter);


/**
 * Inicialización de la aplicación servidor.
 */

app.listen(PORT);
console.log(`Server running on port ${PORT}`);
