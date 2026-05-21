// Adornito en el titulo
const titulos = ["Ingenieria de Software", "Sector Agropecuario", "Mineria de Datos"];
let indice = 0;

setInterval(() => {
  indice = (indice + 1) % titulos.length;
  document.title = titulos[indice];
}, 2000);
