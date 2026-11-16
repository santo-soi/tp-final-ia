class Cardumen {
    // Recibe los usuarios registrados que llegan desde la base de datos y crea un pez por cada uno.
    // Si no hay usuarios, no se dibuja ningún pez.
    constructor(usuarios) {
        this.peces = []; // Array donde se guardarán los peces
        this.indiceSeleccionado = -1;
        this.tiempoUltimoCambio = 0;
        this.crearPeces(usuarios);
    }


    // Crea los peces del cardumen y los guarda en el array `this.peces`.
    crearPeces(usuarios = []) {
        this.peces = []; // Limpia por si se re-ejecuta

        for (let i = 0; i < usuarios.length; i++) {
            let x = random(80, width - 80);
            let y = random(80, height - 80);
            let pez = new Pez(x, y, 120 * 0.42, usuarios[i]);
            this.peces.push(pez);
        }
    }

    gestionarSeleccion() {
        if (millis() - this.tiempoUltimoCambio > 10000) {
            this.indiceSeleccionado = floor(random(this.peces.length));
            this.tiempoUltimoCambio = millis();
        }
        return this.indiceSeleccionado;
    }

    // Devuelve el pez que está iluminado actualmente
    getPezActivo() {
        if (this.indiceSeleccionado >= 0 && this.indiceSeleccionado < this.peces.length) {
            return this.peces[this.indiceSeleccionado];
        }
        return null;
    }

    // Recorre `this.peces` para actualizar y dibujar cada pez.
    dibujarContenido(esOscuro) {
        this.gestionarSeleccion();
        for (let pez of this.peces) {
            let seleccionado = (pez === this.peces[this.indiceSeleccionado]);
            pez.actualizar();
            pez.dibujar(seleccionado, esOscuro);
        }
    }
}

// Clase que estructura el comportamiento de cada pez.
// Cada pez representa a un usuario registrado: su frase y su color
// provienen de la tabla voces y su foto de perfil de la tabla users.
class Pez {
    constructor(x, y, escala, datos) {
        //config inicial del pez
        this.pos = createVector(x, y); //Posición og en el canvas
        this.angulo = random(TWO_PI); //Se le da una dirección por default en base a un ángulo random
        this.escala = escala; //Tamaño del pez
        
        // Datos del usuario que este pez representa
        this.usuario = datos.username;
        this.frase = datos.frase || null; 
        this.color = datos.color || null;
        this.foto = datos.foto || null; 

        // Parametros del nado
        this.noiseOff = random(1000);
        this.faseAleteo = random(TWO_PI);
        this.velocidadBase = random(0.9, 1.5); // Qué tan rápido se desplazan desde un principio.
        this.vel = p5.Vector.fromAngle(this.angulo); // Velocidad que se le irá dándo según la dirección del pez.
        this.acel = createVector(0, 0); // Aceleración al chocar con bordes.
        this.maxFuerzaGiro = 0.04; //Aceleración máxima al girar con los bordes.
    }

    // Evaluá si el usuario cargó la voz.
    tieneVoz() {
        return Boolean(this.frase);
    }

    // Posición del pez por c/ frame.
    actualizar() { 
        // 1. Movimiento pseudo aleatorio: uso de perlin noise para
        // modificar suavemente la dirección hacia donde apunta el pez.
        let cambioAngulo = map(noise(this.noiseOff), 0, 1, -0.14, 0.14);
        this.angulo += cambioAngulo;
        this.noiseOff += 0.018;

        // 2. Determinación de bordes para que no se salga del canvas.
        let margen = 80;
        let deseo = null;

        //En eje x
        if (this.pos.x < margen) {
            deseo = createVector(this.velocidadBase, this.vel.y);
        } else if (this.pos.x > width - margen) {
            deseo = createVector(-this.velocidadBase, this.vel.y);
        }
        //En eje y
        if (this.pos.y < margen) {
            deseo = createVector(deseo ? deseo.x : this.vel.x, this.velocidadBase);
        } else if (this.pos.y > height - margen) {
            deseo = createVector(deseo ? deseo.x : this.vel.x, -this.velocidadBase);
        }

        if (deseo !== null) {
            // Calcula la resta de la velocidad necesaria para alcanzar el punto
            // a donde se dirigirá luego de colisionar con los bordes.
            let direccionBorde = p5.Vector.sub(deseo, this.vel); 
            direccionBorde.limit(this.maxFuerzaGiro); //no superará el valor de la fuerza máxima indicada en el constructor.
            this.acel.add(direccionBorde); 
        }

        // 3. Impulso hacia adelante según el ángulo actual + leve variación de ritmo.
        let impulso = p5.Vector.fromAngle(this.angulo);
        let ritmoNado = this.velocidadBase + sin(this.faseAleteo) * 0.2;
        impulso.mult(ritmoNado);

        // Suaviza la velocidad actual para alcanzar el nuevo rumbo.
        this.vel.lerp(impulso, 0.18);
        this.vel.add(this.acel);
        this.vel.limit(this.velocidadBase * 1.3);
        this.pos.add(this.vel);
        this.acel.mult(0); // Reinicia la acelaración para la próxima colisión.

        // Rota la dirección del pez en base con el vector de velocidad calculado.
        this.angulo = this.vel.heading();
        this.faseAleteo += 0.12;
    }

    dibujarFormaPez(seleccionado, esOscuro) { // Forma del pez a dibujar.
        let s = this.escala; // Tamaño.
        let coleo = sin(this.faseAleteo) * (s * 0.08); // Movimiento sutil de la cola al nadar.
        triangle(-s * 0.46, 0, -s * 0.78, -s * 0.22 + coleo, -s * 0.78, s * 0.22 + coleo);  // Cola articulada.
        ellipse(0, 0, s, s * 0.45); // Cuerpo.

        // Ojo.
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
        rotate(this.angulo); // Rota el pez alrededor de su propio centro.

        // Si el usuario cargó su voz, el pez se pinta con el color que eligió;
        if (this.tieneVoz() && seleccionado) {
            fill(this.color);
            stroke(esOscuro ? 245 : 17);
            strokeWeight(1.8);
        } else {
            // Pez en reposo: blanco marfil en modo claro, translúcido en modo oscuro
            if (esOscuro) {
                fill(30, 41, 59, 220);
                stroke(148, 163, 184);
            } else {
                fill(255);
                stroke(17);
            }
            strokeWeight(1.4);
        }

        this.dibujarFormaPez(seleccionado, esOscuro);
        pop();
    }
}