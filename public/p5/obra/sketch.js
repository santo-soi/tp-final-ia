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
  // Los usuarios registrados llegan desde la vista obra.ejs,
  // serializados desde la base de datos por la ruta /obra.
  const usuarios = window.usuariosObra || [];
  // Un pez por cada usuario; si no hay usuarios, no se dibuja ningún pez.
  cardumen = new Cardumen(usuarios);
  campo = new Campo(width, height);
  campo.generarParticulas();
  background(245, 242, 235);
}

function draw() {
  cardumen.dibujarContenido();
  campo.dibujarCampo();
}

// Detecta el clic en cualquier parte del canvas: se muestra la voz del
// pez con voz más cercano al punto clickeado durante 6 segundos.
function mousePressed() {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    let pezActivo = cardumen.getPezActivo();
    if (pezActivo) mostrarVineta(pezActivo);
  }
}

// Manipula el HTML de la viñeta
function mostrarVineta(pez) {
  if(pez.frase !== null){
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
  resizeCanvas(contenedor.clientWidth, contenedor.clientHeight);  // Canvas responsivo
}
