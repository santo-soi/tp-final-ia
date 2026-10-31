let jsonData = [];
let users = [];

function preload() {
  // Utilizamos la función loadJSON con la ruta '/obra/data' en el servidor.
  loadJSON("/obra/data", data => {
    for(let obj of data) {
      obj.img = loadImage('/uploads/' + obj.filehash);  // Cargamos la imagen desde el servidor en preload porque son acciones async.
      jsonData.push(obj);
    }
  });
}

function setup() {
  const lienzo = createCanvas(600, 400); // Guardamos el objeto del canvas para modificarlo.
  lienzo.parent("contenedor-canvas-p5"); // Especificamos que el canvas va dentro del elemento `contenedor-canvas-p5` de la plantilla.

  for(let obj of jsonData) {
    users.push(new UserData(obj));
  }
}

function draw() {
  background(220);
  for(let obj of users) {
    obj.draw();
  }
}


class UserData {
  constructor(obj) {
    this.data = obj;
    this.size = 100;
    this.x = random(width) - this.size / 2;
    this.y = random(height) - this.size / 2;
  }

  draw() {
    let { img, filename, username, filedesc } = this.data;
    image(img, this.x, this.y, this.size, this.size);
    // fill(random(255), random(255), random(255));
    fill(255);
    textSize(20);
    text(username, this.x, this.y  + textAscent());
    text(filename, this.x, this.y + textAscent() * 2);
    text(filedesc, this.x, this.y + textAscent() * 3);
    this.update();
  }

  update() {
    this.x += random(-2, 2);
    this.y += random(-2, 2);
  }
}