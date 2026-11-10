class Cardumen  { // Clase que estructura construcción de los peces
    constructor() {
        this.peces = []; // Array donde se guardarán los peces
        this.indiceSeleccionado = -1; // Índice del pez iluminado actual
        this.tiempoUltimoCambio = 0;  // Control del tiempo para los 10 segundos
        this.crearPeces();
    }

    // --------------------------------------------------------Configuración general

    actualizarMedidas() { 
        // falta cambiar tamanio del canvas
    }

    // -------------------------------------------------------Desarrollo del contenido que será mostrado en pantalla

    // Crea los peces del cardumen y los guarda en el array `this.peces`.
    crearPeces() {
       this.peces = []; // Limpiamos por si se re-ejecuta
        for (let i = 0; i < 10; i++) {
            let x = random(60, width - 60);
            let y = random(60, height - 60);
            let pez = new Pez(x, y, 120 * 0.42, i);
            this.peces.push(pez);
        }
    }

    // Gestiona el cambio aleatorio del pez iluminado cada 10 segundos (10000 ms)
    gestionarSeleccion() {
        if (millis() - this.tiempoUltimoCambio > 10000) {
            this.indiceSeleccionado = floor(random(this.peces.length));
            this.tiempoUltimoCambio = millis();
        }
    }

    // Recorre `this.peces` para dibujar cada pez y dibuja las indicaciones laterales.
    dibujarCardumen() {
        this.gestionarSeleccion();

        for (let i = 0; i < this.peces.length; i ++) {
            let pez = this.peces[i];
            let esSeleccionado = (i === this.indiceSeleccionado);
            pez.actualizar();
            pez.dibujar(esSeleccionado);
        }
    }

    //---------------------------------------------------------------Exposición del contenido en la pantalla

    dibujarContenido() {
         this.dibujarCardumen();   
        }

}

// Clase que estructura el comportamiento de cada elemento de la grilla (pez).
class Pez {
    constructor(x, y, escala, id) {
        //Posición actual del pez para generar el movimiento por cada frame.
        this.x = x;
        this.y = y;
        this.escala = escala; //Tamaño del pez
        this.id = id 

        // Offsets independientes para que cada pez tenga un movimiento de noise único
        this.xOff = random(1000);
        this.yOff = random(2000);
        this.velocidad = 1.2; // Qué tan rápido se desplazan
        this.angulo = 0; //Ángulo de rotación del pez
    }

    actualizar(ampOnda, velOnda, frecuenciaOnda) { //posición del pez por c/ frame
        
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

        let margen = 50;
        if (this.x < margen) {
            this.x = margen;
            this.xOff += 10; // Cambia su rumbo si toca el borde
        }
        if (this.x > width - margen) {
            this.x = width - margen;
            this.xOff += 10;
        }
        if (this.y < margen) {
            this.y = margen;
            this.yOff += 10;
        }
        if (this.y > height - margen) {
            this.y = height - margen;
            this.yOff += 10;
        }

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

    dibujar(seleccionado) { // Dibuja al pez blanco, pero si está en la columna seleccionada de amarillo.
        push();
        translate(this.x, this.y);
        rotate(radians(this.angulo)); //rota el pez alrededor de su propio centro
        if (seleccionado) fill(255, 220, 0); else fill(0);
        stroke(0);
        strokeWeight(2);
        this.dibujarFormaPez();
        pop();
    }
}