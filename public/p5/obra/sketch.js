let campo;
let cardumen;
let contenedor;
let timeoutVineta;

function setup() {
  // Busca el contenedor del canvas en el DOM
  contenedor = document.getElementById("contenedor-canvas-p5");
  // Leé su ancho y alto actual en píxeles
  let ancho = contenedor.clientWidth;
  let alto = contenedor.clientHeight;
  const lienzo = createCanvas(ancho, alto); // Guarda el objeto del canvas con las medidas del <div>
  lienzo.parent("contenedor-canvas-p5"); // Inserta al canvas dentro del elemento `contenedor-canvas-p5` de la plantilla.
  // canvas secundario del mismo tamaño para acumular las olas
  pgFondo = createGraphics(ancho, alto);
  // Los usuarios registrados llegan desde la vista obra.ejs,
  // serializados desde la base de datos por la ruta /obra.
  const usuarios = window.usuariosObra || [];
  // Un pez por cada usuario; si no hay usuarios, no se dibuja ningún pez.
  cardumen = new Cardumen(usuarios);
  campo = new Campo(width, height);
  campo.generarParticulas();
 
}

function draw() {
  background(245, 242, 235);
  pgFondo.background(245, 242, 235, 12);
  campo.dibujarCampo(pgFondo);
  image(pgFondo, 0, 0);
  cardumen.dibujarContenido();
}

function windowResized() {
  resizeCanvas(contenedor.clientWidth, contenedor.clientHeight);  // Canvas responsivo
  // Redimensiona también la capa de fondo si cambia la ventana
  pgFondo = createGraphics(contenedor.clientWidth, contenedor.clientHeight);
  pgFondo.background(245, 242, 235);
}