class SistemaFiguras {
  constructor() {
    this.figuras = [];
    this.maxFiguras = 8;
    this.ultimoSpawn = 0;
    this.intervaloSpawn = 3200; // Cada ~3.2 segundos puede entrar una figura nueva

    // Generamos 3 figuras iniciales entrando desde los bordes para que no arranque vacío
    for (let i = 0; i < 3; i++) {
      this.figuras.push(new FiguraGeometrica(true));
    }
  }

  actualizarYMostrar(esOscuro) {
    // Genera nuevas figuras aleatoriamente desde afuera
    if (
      this.figuras.length < this.maxFiguras &&
      millis() - this.ultimoSpawn > this.intervaloSpawn
    ) {
      if (random() < 0.65) {
        this.figuras.push(new FiguraGeometrica(false));
      }
      this.ultimoSpawn = millis();
    }

    // Actualiza, dibuja y elimina las que ya terminaron de cruzar la pantalla
    for (let i = this.figuras.length - 1; i >= 0; i--) {
      let fig = this.figuras[i];
      fig.actualizar();
      fig.mostrar(esOscuro);

      if (fig.salioDePantalla()) {
        this.figuras.splice(i, 1);
      }
    }
  }
}

class FiguraGeometrica {
  constructor(arranqueInicial = false) {
    // Tamaño enorme relativo al lienzo
    const base = min(width, height);
    this.tamano = random(base * 0.35, base * 0.72);
    this.radioExterior = this.tamano * 0.6;

    // Misma paleta acuática que la versión 1
    const paleta = [
      [6, 182, 212],   // Cian medio
      [34, 211, 238],  // Cian claro / agua
      [14, 165, 233],  // Celeste océano
      [59, 130, 246],  // Azul brillante
      [99, 102, 241],  // Índigo / violeta azulado
      [129, 140, 248]  // Lavanda azulado suave
    ];
    this.color = random(paleta);
    this.alfa = random(11, 20); // Muy poca opacidad para que al superponerse creen veladuras

    // Tipo de figura geométrica
    this.tipo = random(["circulo", "triangulo", "cuadrado", "hexagono"]);

    // Elegimos un borde de entrada al azar (0: izq, 1: der, 2: arriba, 3: abajo)
    const borde = floor(random(4));
    // Si es arranque inicial, las ubicamos apenas asomando en el borde
    const offsetEntrada = arranqueInicial
      ? this.radioExterior * 0.45
      : this.radioExterior + 20;

    let objetivo;
    if (borde === 0) {
      this.pos = createVector(-offsetEntrada, random(height));
      objetivo = createVector(width * 0.75, random(height * 0.15, height * 0.85));
    } else if (borde === 1) {
      this.pos = createVector(width + offsetEntrada, random(height));
      objetivo = createVector(width * 0.25, random(height * 0.15, height * 0.85));
    } else if (borde === 2) {
      this.pos = createVector(random(width), -offsetEntrada);
      objetivo = createVector(random(width * 0.15, width * 0.85), height * 0.75);
    } else {
      this.pos = createVector(random(width), height + offsetEntrada);
      objetivo = createVector(random(width * 0.15, width * 0.85), height * 0.25);
    }

    // Dirección principal casi recta y velocidad muy lenta
    this.velBase = p5.Vector.sub(objetivo, this.pos);
    this.velBase.normalize();
    this.velocidad = random(0.22, 0.45);
    this.velBase.mult(this.velocidad);

    // Parámetros para la leve deriva orgánica (como el nado suave inicial)
    this.noiseOff = random(1000);
    this.angulo = random(TWO_PI);
    this.velRotacion = random(-0.0012, 0.0012);
    this.entroEnPantalla = false;
  }

  actualizar() {
    // Leve ondulación perpendicular al rumbo principal usando Perlin Noise
    let perpendicular = createVector(-this.velBase.y, this.velBase.x).normalize();
    let deriva = map(noise(this.noiseOff), 0, 1, -0.18, 0.18);
    perpendicular.mult(deriva);

    this.pos.add(this.velBase);
    this.pos.add(perpendicular);

    this.noiseOff += 0.004;
    this.angulo += this.velRotacion;

    // Marcamos cuando ya pisó el área visible para saber cuándo descartarla al salir
    if (
      this.pos.x > 0 &&
      this.pos.x < width &&
      this.pos.y > 0 &&
      this.pos.y < height
    ) {
      this.entroEnPantalla = true;
    }
  }

  salioDePantalla() {
    if (!this.entroEnPantalla) return false;
    const margenSalida = this.radioExterior + 40;
    return (
      this.pos.x < -margenSalida ||
      this.pos.x > width + margenSalida ||
      this.pos.y < -margenSalida ||
      this.pos.y > height + margenSalida
    );
  }

  mostrar(esOscuro) {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angulo);
    noStroke();

    let alfaFinal = esOscuro ? this.alfa * 1.3 : this.alfa;
    fill(this.color[0], this.color[1], this.color[2], alfaFinal);

    const s = this.tamano;

    if (this.tipo === "circulo") {
      circle(0, 0, s);
    } else if (this.tipo === "cuadrado") {
      rectMode(CENTER);
      rect(0, 0, s * 0.85, s * 0.85, 28); // Esquinas suavemente redondeadas
    } else if (this.tipo === "triangulo") {
      const r = s * 0.55;
      triangle(
        cos(-HALF_PI) * r, sin(-HALF_PI) * r,
        cos(-HALF_PI + TWO_PI / 3) * r, sin(-HALF_PI + TWO_PI / 3) * r,
        cos(-HALF_PI + (TWO_PI * 2) / 3) * r, sin(-HALF_PI + (TWO_PI * 2) / 3) * r
      );
    } else if (this.tipo === "hexagono") {
      const r = s * 0.5;
      beginShape();
      for (let i = 0; i < 6; i++) {
        let a = (TWO_PI / 6) * i;
        vertex(cos(a) * r, sin(a) * r);
      }
      endShape(CLOSE);
    }

    pop();
  }
}