let campo;
let cardumen;
let contenedor;
let timeoutVineta;
let capaFondo;

function setup() {
  contenedor = document.getElementById("contenedor-canvas-p5");
  let ancho = contenedor.clientWidth;
  let alto = contenedor.clientHeight;

  const lienzo = createCanvas(ancho, alto);
  lienzo.parent("contenedor-canvas-p5");

  // Capa persistente donde se dibuja la textura de corrientes sin borrarla
  capaFondo = createGraphics(ancho, alto);
  iniciarFondo();

  const usuarios = window.usuariosObra || [];
  cardumen = new Cardumen(usuarios);

  campo = new Campo(ancho, alto);
  campo.generarParticulas();
}

function iniciarFondo() {
  const esOscuro = document.documentElement.classList.contains("dark");
  if (esOscuro) {
    capaFondo.background(15, 23, 42); // slate-900 (#0f172a)
  } else {
    capaFondo.background(242, 250, 252); // Cian muy clarito, apenas separado del blanco
  }
}

function draw() {
  const esOscuro = document.documentElement.classList.contains("dark");

  // 1. Las partículas dibujan sobre la capa persistente
  campo.dibujarCampo(capaFondo, esOscuro);

  // 2. Estampamos la capa del fondo en el canvas principal (esto borra la estela de los peces)
  image(capaFondo, 0, 0);

  // 3. Dibujamos los peces limpios por encima
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
  let ancho = contenedor.clientWidth;
  let alto = contenedor.clientHeight;
  resizeCanvas(ancho, alto);

  // Redimensiona la capa de fondo manteniendo lo dibujado
  let nuevaCapa = createGraphics(ancho, alto);
  nuevaCapa.image(capaFondo, 0, 0);
  capaFondo = nuevaCapa;
}