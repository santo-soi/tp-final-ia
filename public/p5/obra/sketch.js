let campo;
let cardumen;
let contenedor;
let timeoutVineta;
let capaFondo;
let muestraCapaFondo;
let temaAnterior = null;

function setup() {
  // Busca el contenedor del canvas
  contenedor = document.getElementById("contenedor-canvas-p5");
  // Leé su ancho y alto actual en píxeles
  let ancho = contenedor.clientWidth;
  let alto = contenedor.clientHeight;

  const lienzo = createCanvas(ancho, alto); // Guarda el objeto del canvas con las medidas del <div>
  lienzo.parent("contenedor-canvas-p5"); // Inserta al canvas dentro del elemento `contenedor-canvas-p5` de la plantilla.
  
  // canvas secundario del mismo tamaño para acumular las olas
  capaFondo = createGraphics(ancho, alto);
  iniciarFondo();
  temaAnterior = document.documentElement.classList.contains("dark");
  
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
  if (esOscuro) capaFondo.background(15, 23, 42);
  else capaFondo.background(242, 250, 252);
}

function draw() {
  let esOscuro = document.documentElement.classList.contains("dark");
  if (temaAnterior !== esOscuro) {
    iniciarFondo();
    temaAnterior = esOscuro;
    campo.generarParticulas();
  } else {
    // Fondo con opacidad muy baja en cada frame; haciendo que las trazas viejas se desvanezcan lentamente. 
    if (esOscuro) capaFondo.background(15, 23, 42, 2);
    else capaFondo.background(242, 250, 252, 2);
  }
  campo.dibujarCampo(capaFondo, esOscuro);
  muestraCapaFondo = image(capaFondo, 0, 0);
  cardumen.dibujarContenido(esOscuro);
}

// Detecta el clic en cualquier parte del canvas: se muestra la voz del
// pez activo durante 6 segundos.
function mousePressed() {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    let pezActivo = cardumen.getPezActivo();
    if (pezActivo) mostrarVineta(pezActivo);
  }
}

// Manipula el HTML de la viñeta
function mostrarVineta(pez) {
  if (pez.frase !== null) {
    let divVineta = document.getElementById("vineta-frase");
    let imgFoto = document.getElementById("vineta-foto");
    let spanUsuario = document.getElementById("vineta-usuario");
    let pTexto = document.getElementById("vineta-texto");

    // Inyecta los datos del pez activo
    spanUsuario.textContent = pez.usuario;
    pTexto.textContent = `“${pez.frase}”`;

    // Muestra la foto de perfil si el usuario la subió
    if (pez.foto) {
      imgFoto.src = pez.foto;
      imgFoto.alt = `Foto de perfil de ${pez.usuario}`;
      imgFoto.classList.remove("hidden");
    } else {
      imgFoto.removeAttribute("src");
      imgFoto.alt = "";
      imgFoto.classList.add("hidden");
    }

    // Muestra la viñeta agregando la clase de opacidad
    divVineta.classList.remove("opacity-0");
    divVineta.classList.add("opacity-100");

    // Se desvanece automáticamente después de 6 segundos.
    // Si hay un clic nuevo antes, se reinicia el conteo.
    clearTimeout(timeoutVineta);
    timeoutVineta = setTimeout(() => {
      divVineta.classList.remove("opacity-100");
      divVineta.classList.add("opacity-0");
    }, 6000);
  }
}

function windowResized() {
  resizeCanvas(contenedor.clientWidth, contenedor.clientHeight); // Canvas responsivo
  // Redimensiona también la capa de fondo si cambia la ventana
  capaFondo = createGraphics(contenedor.clientWidth, contenedor.clientHeight);
  iniciarFondo();
}