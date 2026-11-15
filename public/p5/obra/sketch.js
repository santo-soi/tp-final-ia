let campo;
let cardumen;
let contenedor;
let timeoutVineta;
let capaFondo;
let muestraCapaFondo;
let temaAnterior = null;

function setup() {
  // Busca el contenedor del canvas en el DOM
  contenedor = document.getElementById("contenedor-canvas-p5");
  // Leé su ancho y alto actual en píxeles
  let ancho = contenedor.clientWidth;
  let alto = contenedor.clientHeight;

  const lienzo = createCanvas(ancho, alto); // Guarda el objeto del canvas con las medidas del <div>
  lienzo.parent("contenedor-canvas-p5"); // Inserta al canvas dentro del elemento `contenedor-canvas-p5` de la plantilla.
  
  // canvas secundario del mismo tamaño para acumular las olas
  capaFondo = createGraphics(ancho, alto);
  iniciarFondo();
  temaAnterior  = document.documentElement.classList.contains("dark");
  
  // Los usuarios registrados llegan desde la vista obra.ejs,
  // serializados desde la base de datos por la ruta /obra.
  const usuarios = window.usuariosObra || [];
  // Un pez por cada usuario; si no hay usuarios, no se dibuja ningún pez.
  cardumen = new Cardumen(usuarios);
  
  campo = new Campo(width, height);
  campo.generarParticulas();
}

function iniciarFondo() { // Cambia los colores según si está activado el modo oscuro.
  let esOscuro = document.documentElement.classList.contains("dark");
  if (esOscuro) capaFondo.background(15, 23, 42); // slate-900 (#0f172a) 
  else capaFondo.background(242, 250, 252); // Cian muy clarito, apenas separado del blanco
}

function draw() {
  let esOscuro = document.documentElement.classList.contains("dark");
  if (temaAnterior !== esOscuro) {
    iniciarFondo();
    temaAnterior = esOscuro;
    campo.generarParticulas();
  } else {
    // Fondo con opacidad muy baja en cada frame; haciendo que las trazas viejas se desvanezcan lentamente. 
    // Esto permite que las nuevas líneas de las partículas se "impriman" y respiren texturizadas.
    if (esOscuro) capaFondo.background(15, 23, 42, 2); // Slate-900 con alfa sutil
    else capaFondo.background(242, 250, 252, 2); // Cian claro con alfa sutil
    
  }
  campo.dibujarCampo(capaFondo, esOscuro);
  muestraCapaFondo = image(capaFondo, 0, 0);
  cardumen.dibujarContenido(esOscuro);
}

function windowResized() {
  resizeCanvas(contenedor.clientWidth, contenedor.clientHeight);  // Canvas responsivo
  // Redimensiona también la capa de fondo si cambia la ventana
  capaFondo = createGraphics(contenedor.clientWidth, contenedor.clientHeight);
  muestraCapaFondocapaFondo = image(capaFondo, 0, 0);
  
}