let jsonData = [];

function preload() {
    loadJSON('/obra/data', data => {
        for(obj of data) {
            obj.img = loadImage('/uploads/' + obj.filehash);
            jsonData.push(obj);
        }
    });  // Utilizamos la función loadJSON con la ruta '/obra/data' en el servidor.
}

function setup() {
  const lienzo = createCanvas(600, 400);  // Guardamos el objeto del canvas para modificarlo.
  lienzo.parent('contenedor-canvas-p5');  // Especificamos que el canvas va dentro del elemento `contenedor-canvas` de la plantilla.
  print(jsonData);  // PROBLEMA, ATENCIÓN: El tipo de dato es un objeto con tantos índices como entradas en la base de datos, 0, 1, 2, ...
}

function draw() {
  background(220);
}
