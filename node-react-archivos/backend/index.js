const http = require("http");
const requestHandler = require("./request-handler");
const server = http.createServer(requestHandler);
//el punto despues de http significa que es un objeto

server.listen(5000, () => {
  console.log(
    "el servidor esta escuchando peticiones en http://localhost:5000/"
  );
});
