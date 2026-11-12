class Campo {
    constructor(w, h){
        this.escala = 20;
        this.inc = 0.1;
        this.zOff = 0;
        this.zOffInc = 0.0001;
        this.cols = w  / this.escala;
        this.filas = h / this.escala;
        this.particulas = [];
        this.corrientes = []
    }

    generarParticulas(){
        for(let i=0; i < 250; i++){
            this.particulas[i] = new Particula();
        }
    }

    dibujarCampo(){
        let yOff = 0;
        stroke(0, 50);
        strokeWeight(1);
        for(let y  = 0; y < this.filas; y++){
            let xOff = 0;
            for (let x = 0; x < this.cols; x ++){
                let indiceCorriente = x + y * this.cols
                let r = noise(xOff, yOff, this.zOff) * 360 * 4;
                let v = p5.Vector.fromAngle(radians(r));
                v.setMag(0.05);
                this.corrientes[indiceCorriente] = v;
                xOff += this.inc;
                // push();
                // translate(x * this.escala, y * this.escala);
                // rotate(v.heading());
                // line(0,0, this.escala, 0);
                // pop();
                
            }
        yOff += this.inc;
        this.zOff += this.zOffInc;
        }

        for(let particula of this.particulas){
             particula.seguirVector(this.escala, this.cols, this.corrientes);
             particula.actualizar();
             particula.fronteras();
             particula.mostrarParticula();
        }
    }
}

class Particula {
    constructor(){
        this.pos = createVector(random(width), random(height));
        this.vel = createVector(0,0);
        this.maxVel = 5;
        this.acel = createVector(0,0); 
        this.historial = [];
        this.maxLongitudHistorial = 18;
    }

    actualizar(){
        this.vel.add(this.acel);
        this.vel.limit(this.maxVel);
        this.pos.add(this.vel);
        this.acel.mult(0);
        this.historial.push(this.pos.copy()); // Guardamos la posición actual en el historial
        if (this.historial.length > this.maxLongitudHistorial) this.historial.shift(); // Si el historial supera el límite, borramos el punto más viejo
    }

    seguirVector(escala, columnas, corrientes){
        let x = floor(this.pos.x / escala);
        let y = floor(this.pos.y / escala);

        x = constrain(x, 0, columnas - 1);
        let filas = corrientes.length / columnas;
        y = constrain(y, 0, filas - 1);

        let indice = x + y * columnas;
        let fuerza = corrientes[indice]; 
        this.incFuerza(fuerza);
    }

    incFuerza(fuerza){
        this.acel.add(fuerza);
    }

    mostrarParticula(){
        stroke(0, 5);
        strokeWeight(5);
        //point(this.pos.x, this.pos.y);
        //line(this.pos.x, this.pos.y, this.posBase.x, this.posBase.y);

        beginShape();
        for (let v of this.historial) {
            vertex(v.x, v.y); 
            // Nota: Si querés que las curvas sean aún más suaves, 
            // podés cambiar `vertex` por `curveVertex`
        }
        endShape();

        //this.actualizarBase();
    }

    actualizarBase(){
        this.posBase.x = this.pos.x;
        this.posBase.y = this.pos.y;
    }

    fronteras(){
       let atravesoBorde = false;
        if (this.pos.x < 0) { this.pos.x = width; atravesoBorde = true; }
        if (this.pos.x > width) { this.pos.x = 0; atravesoBorde = true; }
        if (this.pos.y < 0) { this.pos.y = height; atravesoBorde = true; }
        if (this.pos.y > height) { this.pos.y = 0; atravesoBorde = true; }

        if (atravesoBorde) {
            this.historial = [];
            this.historial.push(this.pos.copy());
        }
    }
}