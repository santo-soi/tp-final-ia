class Campo {
    constructor(w, h){
        this.escala = 20;
        this.inc = 0.1;
        this.zOff = 0;
        this.zOffInc = 0.0001;
        this.cols = ceil(w  / this.escala);
        this.filas = ceil(h / this.escala);
        this.particulas = [];
        this.corrientes = []
    }

    generarParticulas(){
        for(let i=0; i < 1000; i++){
            this.particulas[i] = new Particula();
        }
    }

    dibujarCampo(capaFondo, esOscuro){
        // Algoritmo que determinará la dirección pseudo aleatoria de los vectores
        // través de bucles for() que modificarán su dirección con incrementos sobre los offset de noise()
        // y dividirán el canvas en una grilla. 
        //  
        let yOff = 0;
        for(let y  = 0; y < this.filas; y++){
            let xOff = 0;
            for (let x = 0; x < this.cols; x ++){
                let indiceCorriente = x + y * this.cols
                let r = noise(xOff, yOff, this.zOff) * 360 * 4;
                let v = p5.Vector.fromAngle(radians(r));
                v.setMag(0.08);
                this.corrientes[indiceCorriente] = v;
                xOff += this.inc;
            }
        yOff += this.inc;
        }
        this.zOff += this.zOffInc;

        for(let particula of this.particulas){
             particula.seguirVector(this.escala, this.cols, this.filas, this.corrientes);
             particula.actualizar();
             particula.fronteras();
             particula.mostrarParticula(capaFondo, esOscuro);
        }
    }
}

class Particula {
    constructor(){
        this.pos = createVector(random(width), random(height)); //posición actual de c/ partícula
        this.posBase = this.pos.copy(); //posición incial de c/ partícula
        this.vel = createVector(0,0);
        this.maxVel = 3;
        this.acel = createVector(0,0); 
        this.paleta = [
        [6, 182, 212],   // Cian medio
        [34, 211, 238],  // Cian claro / agua
        [14, 165, 233],  // Celeste océano
        [59, 130, 246],  // Azul brillante
        [99, 102, 241],  // Índigo / violeta azulado
        [129, 140, 248]  // Lavanda azulado suave
        ];
        this.color = random(this.paleta);
    }

    actualizar(){
        this.vel.add(this.acel);
        this.vel.mult(0.95); // Leve fricción para que siga la corriente sin salir disparada
        this.vel.limit(this.maxVel);
        this.pos.add(this.vel);
        this.acel.mult(0);
    }

    //Seguirá la dirección del vector más cercano al lugar de la grilla donde se encuentra
    seguirVector(escala, columnas, filas, corrientes){ 
        let x = constrain(floor(this.pos.x / escala), 0, columnas -1);
        let y = constrain(floor(this.pos.y / escala), 0, filas - 1);
        let indice = x + y * columnas;
        let fuerza = corrientes[indice]; 
        this.incFuerza(fuerza);
    }

    incFuerza(fuerza){
        this.acel.add(fuerza);
    }

    mostrarParticula(capaFondo, esOscuro){
        capaFondo.noFill();
        let alfa = esOscuro ? 10 : 7;
        capaFondo.stroke(this.color[0], this.color[1], this.color[2], alfa); // Tono oscuro y semitransparente para las olas de fondo
        capaFondo.strokeWeight(2);
        capaFondo.line(this.pos.x, this.pos.y, this.posBase.x, this.posBase.y);
        this.actualizarBase();
    }

    actualizarBase(){
        this.posBase.x = this.pos.x;
        this.posBase.y = this.pos.y;
    }

    fronteras(){
        if (this.pos.x < 0) { this.pos.x = width; this.actualizarBase() }
        if (this.pos.x > width) { this.pos.x = 0; this.actualizarBase() }
        if (this.pos.y < 0) { this.pos.y = height; this.actualizarBase() }
        if (this.pos.y > height) { this.pos.y = 0; this.actualizarBase() }
    }
}