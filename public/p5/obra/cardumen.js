class Cardumen {
  constructor(usuarios) {
    this.peces = [];
    this.indiceSeleccionado = -1;
    this.tiempoUltimoCambio = 0;
    this.crearPeces(usuarios);
  }

  crearPeces(usuarios = []) {
    this.peces = [];
    for (let i = 0; i < usuarios.length; i++) {
      let x = random(80, width - 80);
      let y = random(80, height - 80);
      let pez = new Pez(x, y, 48, usuarios[i]);
      this.peces.push(pez);
    }
    // Selecciona un pez con voz apenas arranca si existe alguno
    this.seleccionarSiguiente();
  }

  seleccionarSiguiente() {
    if (this.peces.length === 0) return;
    // Prioriza peces que tengan voz cargada para que siempre haya uno iluminado
    const conVoz = this.peces
      .map((p, idx) => ({ p, idx }))
      .filter(item => item.p.tieneVoz());

    if (conVoz.length > 0) {
      const elegido = random(conVoz);
      this.indiceSeleccionado = elegido.idx;
    } else {
      this.indiceSeleccionado = floor(random(this.peces.length));
    }
    this.tiempoUltimoCambio = millis();
  }

  gestionarSeleccion() {
    if (millis() - this.tiempoUltimoCambio > 10000) {
      this.seleccionarSiguiente();
    }
    return this.indiceSeleccionado;
  }

  getPezActivo() {
    if (this.indiceSeleccionado >= 0 && this.indiceSeleccionado < this.peces.length) {
      return this.peces[this.indiceSeleccionado];
    }
    return null;
  }

  dibujarContenido(esOscuro) {
    this.gestionarSeleccion();
    for (let pez of this.peces) {
      let seleccionado = (pez === this.peces[this.indiceSeleccionado]);
      pez.actualizar();
      pez.dibujar(seleccionado, esOscuro);
    }
  }
}

class Pez {
  constructor(x, y, escala, datos) {
    this.pos = createVector(x, y);
    this.angulo = random(TWO_PI);
    this.vel = p5.Vector.fromAngle(this.angulo);
    this.acel = createVector(0, 0);

    this.escala = escala;
    this.usuario = datos.username;
    this.frase = datos.frase || null;
    this.color = datos.color || null;
    this.foto = datos.foto || null;

    // Parámetros de nado natural
    this.noiseOff = random(1000);
    this.faseAleteo = random(TWO_PI);
    this.velocidadBase = random(0.9, 1.5);
    this.maxFuerzaGiro = 0.04;
  }

  tieneVoz() {
    return Boolean(this.frase);
  }

  actualizar() {
    // 1. Giro orgánico: el ruido modifica suavemente la dirección hacia donde apunta
    let cambioAngulo = map(noise(this.noiseOff), 0, 1, -0.14, 0.14);
    this.angulo += cambioAngulo;
    this.noiseOff += 0.018;

    // 2. Evitación suave de bordes (dobla antes de chocar contra el vidrio)
    let margen = 80;
    let deseo = null;

    if (this.pos.x < margen) {
      deseo = createVector(this.velocidadBase, this.vel.y);
    } else if (this.pos.x > width - margen) {
      deseo = createVector(-this.velocidadBase, this.vel.y);
    }

    if (this.pos.y < margen) {
      deseo = createVector(deseo ? deseo.x : this.vel.x, this.velocidadBase);
    } else if (this.pos.y > height - margen) {
      deseo = createVector(deseo ? deseo.x : this.vel.x, -this.velocidadBase);
    }

    if (deseo !== null) {
      deseo.normalize();
      deseo.mult(this.velocidadBase);
      let direccionBorde = p5.Vector.sub(deseo, this.vel);
      direccionBorde.limit(this.maxFuerzaGiro);
      this.acel.add(direccionBorde);
    }

    // 3. Impulso hacia adelante según el ángulo actual + leve variación de ritmo
    let impulso = p5.Vector.fromAngle(this.angulo);
    let ritmoNado = this.velocidadBase + sin(this.faseAleteo) * 0.2;
    impulso.mult(ritmoNado);

    // Mezclamos suavemente la velocidad actual con el nuevo rumbo
    this.vel.lerp(impulso, 0.18);
    this.vel.add(this.acel);
    this.vel.limit(this.velocidadBase * 1.3);

    this.pos.add(this.vel);
    this.acel.mult(0);

    // Sincronizamos el ángulo visual con el vector real de movimiento
    this.angulo = this.vel.heading();
    this.faseAleteo += 0.12;
  }

  dibujarFormaPez(esOscuro, seleccionado) {
    let s = this.escala;
    // Movimiento sutil de la cola al nadar
    let coleo = sin(this.faseAleteo) * (s * 0.08);

    // Cuerpo
    ellipse(0, 0, s, s * 0.44);

    // Cola articulada
    triangle(
      -s * 0.46, 0,
      -s * 0.78, -s * 0.22 + coleo,
      -s * 0.78, s * 0.22 + coleo
    );

    // Ojo
    noStroke();
    if (this.tieneVoz() && seleccionado) {
      fill(255);
    } else {
      fill(esOscuro ? 15 : 17);
    }
    circle(s * 0.26, -s * 0.06, s * 0.07);
  }

  dibujar(seleccionado, esOscuro) {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angulo); // Ya está en radianes

    if (this.tieneVoz() && seleccionado) {
      fill(this.color);
      stroke(esOscuro ? 245 : 17);
      strokeWeight(1.8);
    } else {
      // Pez en reposo: blanco marfil en modo claro, translúcido/pizarra en modo oscuro
      if (esOscuro) {
        fill(30, 41, 59, 220);
        stroke(148, 163, 184);
      } else {
        fill(255);
        stroke(17);
      }
      strokeWeight(1.4);
    }

    this.dibujarFormaPez(esOscuro, seleccionado);
    pop();
  }
}