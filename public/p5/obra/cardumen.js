class Cardumen {
    // Recibe los usuarios registrados que llegan desde la base de datos
    // (una fila por usuario de la tabla users) y crea un pez por cada uno.
    // Si no hay usuarios, no se dibuja ningún pez.
    constructor(usuarios) {
        this.peces = []; // Array donde se guardarán los peces
        this.indiceSeleccionado = -1;
        this.tiempoUltimoCambio = 0;
        this.crearPeces(usuarios);
    }

    // -------------------------------------------------------Desarrollo del contenido que será mostrado en pantalla

    // Crea los peces del cardumen y los guarda en el array `this.peces`.
    crearPeces(usuarios = []) {
        this.peces = []; // Limpiamos por si se re-ejecuta

        for (let i = 0; i < usuarios.length; i++) {
            let x = random(60, width - 60);
            let y = random(60, height - 60);
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
    dibujarContenido() {
        this.gestionarSeleccion();
        for (let pez of this.peces) {
            let seleccionado = (pez === this.peces[this.indiceSeleccionado]);
            pez.actualizar();
            pez.dibujar(seleccionado);
        }
    }
}

// Clase que estructura el comportamiento de cada pez.
// Cada pez representa a un usuario registrado: su frase y su color
// provienen de la tabla voces y su foto de perfil de la tabla users.
class Pez {
    constructor(x, y, escala, datos) {
        //Posición actual del pez para generar el movimiento por cada frame.
        this.x = x;
        this.y = y;
        this.escala = escala; //Tamaño del pez
        // Datos del usuario que este pez representa
        this.usuario = datos.username;
        this.frase = datos.frase || null; // Sin voz cargada -> null
        this.color = datos.color || null;
        this.foto = datos.foto || null; // Ruta pública de la foto de perfil
        // Offsets independientes para que cada pez tenga un movimiento de noise único
        this.xOff = random(1000);
        this.yOff = random(2000);
        this.velocidad = 1.2; // Qué tan rápido se desplazan
        this.angulo = 0; //Ángulo de rotación del pez
    }

    // Un pez "tiene voz" cuando su usuario cargó su frase.
    tieneVoz() {
        return Boolean(this.frase);
    }

    actualizar() { //posición del pez por c/ frame

        // Generamos desplazamiento suave y orgánico usando Perlin Noise
        let vx = map(noise(this.xOff), 0, 1, -this.velocidad, this.velocidad);
        let vy = map(noise(this.yOff), 0, 1, -this.velocidad, this.velocidad);
        this.x += vx;
        this.y += vy;
        // Avanzamos en el tiempo del noise para el próximo frame
        this.xOff += 0.008;
        this.yOff += 0.008;
        // Calculamos la rotación del pez según hacia dónde se está moviendo
        this.angulo = atan2(vy, vx);
        // Cambia su rumbo si toca el borde
        let margen = 50; 
        if (this.x < margen) this.x = margen; this.xOff += 10; 
        if (this.x > width - margen) this.x = width - margen; this.xOff += 10;
        if (this.y < margen)  this.y = margen; this.yOff += 10;
        if (this.y > height - margen) this.y = height - margen; this.yOff += 10;
    }

    dibujarFormaPez() { // Forma del pez a dibujar.
        let s = this.escala; // Tamanio
        ellipse(0, 0, s, s * 0.45); // Cuerpo
        triangle(-s * 0.5, 0, -s * 0.78, -s * 0.22, -s * 0.78, s * 0.22); // Cola
        // Ojo
        fill(255);
        noStroke();
        circle(s * 0.25, -s * 0.07, s * 0.07);
    }

    dibujar(seleccionado) {
        push();
        translate(this.x, this.y);
        rotate(radians(this.angulo)); //rota el pez alrededor de su propio centro
        // Si el usuario cargó su voz, el pez se pinta con el color que eligió;
        // si todavía no la cargó, permanece en blanco.
        if (this.tieneVoz() && seleccionado) fill(this.color); else fill(255);
        stroke(0);
        strokeWeight(2);
        this.dibujarFormaPez();
        pop();
    }
}
