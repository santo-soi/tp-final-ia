let sistemaFiguras;
let cardumen;
let contenedor;
let timeoutVineta;

function setup() {
  contenedor = document.getElementById("contenedor-canvas-p5");
  let ancho = contenedor.clientWidth;
  let alto = contenedor.clientHeight;

  const lienzo = createCanvas(ancho, alto);
  lienzo.parent("contenedor-canvas-p5");

  const usuarios = window.usuariosObra || [];
  cardumen = new Cardumen(usuarios);

  sistemaFiguras = new SistemaFiguras();
}

function draw() {
  const esOscuro = document.documentElement.classList.contains("dark");

  // Mismo celeste/cian muy clarito de la versión 1 (y compatibilidad con modo oscuro)
  if (esOscuro) {
    background(15, 23, 42); // slate-900 (#0f172a)
  } else {
    background(242, 250, 252);
  }

  // 1. Figuras geométricas gigantes flotando en el fondo
  sistemaFiguras.actualizarYMostrar(esOscuro);

  // 2. Peces idénticos a la versión 1
  cardumen.dibujarContenido(esOscuro);
}

function mousePressed() {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    let pezActivo = cardumen.getPezActivo();
    if (pezActivo) mostrarVineta(pezActivo);
  }
}

function mostrarVineta(pez) {
  if (pez.frase !== null) {
    let divVineta = document.getElementById("vineta-frase");
    let imgFoto = document.getElementById("vineta-foto");
    let spanUsuario = document.getElementById("vineta-usuario");
    let pTexto = document.getElementById("vineta-texto");

    spanUsuario.textContent = pez.usuario;
    pTexto.textContent = `“${pez.frase}”`;

    if (pez.foto) {
      imgFoto.src = pez.foto;
      imgFoto.alt = `Foto de perfil de ${pez.usuario}`;
      imgFoto.classList.remove("hidden");
    } else {
      imgFoto.removeAttribute("src");
      imgFoto.alt = "";
      imgFoto.classList.add("hidden");
    }

    divVineta.classList.remove("opacity-0");
    divVineta.classList.add("opacity-100");

    clearTimeout(timeoutVineta);
    timeoutVineta = setTimeout(() => {
      divVineta.classList.remove("opacity-100");
      divVineta.classList.add("opacity-0");
    }, 6000);
  }
}

function windowResized() {
  resizeCanvas(contenedor.clientWidth, contenedor.clientHeight);
}