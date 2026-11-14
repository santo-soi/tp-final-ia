class Campo {
  constructor(w, h) {
    this.escala = 30;
    this.inc = 0.05; // Un poco más amplio para curvas más suaves
    this.zOff = 0;
    this.zOffInc = 0.0015; // Evoluciona más rápido para que los "ríos" se muevan y no marquen siempre el mismo surco
    this.cols = ceil(w / this.escala);
    this.filas = ceil(h / this.escala);
    this.particulas = [];
    this.corrientes = [];
  }

  generarParticulas() {
    for (let i = 0; i < 160; i++) {
      this.particulas[i] = new Particula();
    }
  }

  dibujarCampo(pg, esOscuro) {
    let yOff = 0;
    for (let y = 0; y < this.filas; y++) {
      let xOff = 0;
      for (let x = 0; x < this.cols; x++) {
        let indiceCorriente = x + y * this.cols;
        let r = noise(xOff, yOff, this.zOff) * TWO_PI * 2;
        let v = p5.Vector.fromAngle(r);
        v.setMag(0.08);
        this.corrientes[indiceCorriente] = v;
        xOff += this.inc;
      }
      yOff += this.inc;
    }
    this.zOff += this.zOffInc;

    for (let particula of this.particulas) {
      particula.seguirVector(this.escala, this.cols, this.filas, this.corrientes);
      particula.actualizar();
      particula.fronteras();
      particula.mostrarParticula(pg, esOscuro);
    }
  }
}

class Particula {
  constructor() {
    this.historial = [];
    this.maxLongitudHistorial = 20;
    this.maxVel = 2.0;

    const paleta = [
      [6, 182, 212],   // Cian medio
      [34, 211, 238],  // Cian claro / agua
      [14, 165, 233],  // Celeste océano
      [59, 130, 246],  // Azul brillante
      [99, 102, 241],  // Índigo / violeta azulado
      [129, 140, 248]  // Lavanda azulado suave
    ];
    this.color = random(paleta);
    this.reiniciar();
  }

  // Ubica la partícula en un punto nuevo al azar con vida renovada
  reiniciar() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(0, 0);
    this.acel = createVector(0, 0);
    this.historial = [];
    this.vida = random(720, 1680);
  }

  actualizar() {
    this.vel.add(this.acel);
    this.vel.mult(0.95); // Leve fricción para que siga la corriente sin salir disparada
    this.vel.limit(this.maxVel);
    this.pos.add(this.vel);
    this.acel.mult(0);

    this.historial.push(this.pos.copy());
    if (this.historial.length > this.maxLongitudHistorial) {
      this.historial.shift();
    }

    // Descontamos vida; si llega a 0, salta a una zona nueva del lienzo
    this.vida--;
    if (this.vida <= 0) {
      this.reiniciar();
    }
  }

  seguirVector(escala, columnas, filas, corrientes) {
    let x = constrain(floor(this.pos.x / escala), 0, columnas - 1);
    let y = constrain(floor(this.pos.y / escala), 0, filas - 1);
    let indice = x + y * columnas;
    let fuerza = corrientes[indice];
    if (fuerza) this.acel.add(fuerza);
  }

  mostrarParticula(pg, esOscuro) {
    if (this.historial.length < 2) return;

    pg.noFill();
    let alfa = esOscuro ? 10 : 7;
    pg.stroke(this.color[0], this.color[1], this.color[2], alfa);
    pg.strokeWeight(1.3);

    pg.beginShape();
    for (let v of this.historial) {
      pg.curveVertex(v.x, v.y);
    }
    pg.endShape();
  }

  fronteras() {
    let atravesoBorde = false;
    if (this.pos.x < 0) { this.pos.x = width; atravesoBorde = true; }
    if (this.pos.x > width) { this.pos.x = 0; atravesoBorde = true; }
    if (this.pos.y < 0) { this.pos.y = height; atravesoBorde = true; }
    if (this.pos.y > height) { this.pos.y = 0; atravesoBorde = true; }

    if (atravesoBorde) {
      this.historial = [];
    }
  }
}