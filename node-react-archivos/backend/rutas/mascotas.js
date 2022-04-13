const { crear, obtenerUno, listar } = require("../data-handler");
const directorioEntidad = "mascotas";

module.exports = function mascotasHandler(mascotas) {
  return {
    get: async (data, callback) => {
      console.log("handler mascotas", { data });
      if (typeof data.indice !== "undefined") {
        const _mascota = await obtenerUno({
          directorioEntidad: "mascotas",
          nombreArchivo: data.indice,
        });
        return callback(200, _mascota);
      }

      /* verifico que data.query traiga datos
      en tipo o nombre o dueno, esto significa
      que el request es una búsqueda */
      if (
        data.query &&
        (data.query.nombre || data.query.tipo || data.query.dueno)
      ) {
        //creo un array con las llaves del objeto data query
        const llavesQuery = Object.keys(data.query);
        /* clono el array de mascotas que viene de reucursos  y este
        irá guardando los resultados */
        let respuestaMascotas = [...mascotas];

        /* filtro el array de respuestas con el fin solamente dejar
          los objetos de mascota que cumplen con la búsqueda */
        respuestaMascotas = respuestaMascotas.filter((_mascota) => {
          let resultado = false;
          /* recorro cada una de las llaves con el fin de filtrar
        según los criterios de búsqueda */
          for (const llave of llavesQuery) {
            /*  creo una expresión regular para que la búsqueda
           devuelva el resultado aunque sea may. o min. o partes parciales
           de una palabra poniendo el ig ej: gat de gato*/
            const expresionRegular = new RegExp(data.query[llave], "ig");
            /* resultado  guarda la verificación de la expresión regular en cada uno de los campos 
            búsqueda y los objetos de mascota, nos dice si el criterio está
            o no, en el objeto de mascota que estamos evaluando en el momento */
            resultado = _mascota[llave].match(expresionRegular);
            /* si resultado es diferente a falso o null (.match entrega null cuando 
            no hay match) entonces rompemos (break) el ciclo for */

            if (resultado) {
              break;
            }
          }
          /* null es falso por lo tanto el filter ignorará resultado === null
           y los que si tengan el criterio de búsqueda entran al array respuestaMascotas */
          return resultado;
        });

        return callback(200, respuestaMascotas);
      }
      try {
        const _mascotas = await listar({ directorioEntidad: "mascotas" });
        callback(200, _mascotas);
      } catch (error) {
        if (error) {
          return callback(500, { mensaje: error.message });
        }
      }
    },
    post: (data, callback) => {
      if (data && data.payload && data.payload.id) {
        crear(
          {
            directorioEntidad,
            nombreArchivo: data.payload.id,
            datosGuardar: data.payload,
          },
          (error) => {
            if (error) {
              return callback(500, { mensaje: error.message });
            }
            callback(201, data.payload);
          }
        );
      }
    },
    put: (data, callback) => {
      if (typeof data.indice !== "undefined") {
        if (mascotas[data.indice]) {
          mascotas[data.indice] = data.payload;
          return callback(200, mascotas[data.indice]);
        }
        return callback(404, {
          mensaje: `mascota con indice ${data.indice} no encontrada`,
        });
      }
      callback(400, { mensaje: "indice no enviado" });
    },
    delete: (data, callback) => {
      if (typeof data.indice !== "undefined") {
        if (mascotas[data.indice]) {
          /* esta condicional, esta pidiendo un data.indice y en la siguiente linea
           le está diciendo que mascotas sea igual a lo mismo, pero
           filtrando que el indice pasado anteriormente no esté en él. Ya que será
           el que se va a eliminar */
          mascotas = mascotas.filter(
            (_mascota, indice) => indice != data.indice
          ); // la _ indica que puede que se use o no esa variable
          return callback(204, {
            mensaje: `elemento con indice ${data.indice} eliminado`,
          });
        }
        return callback(404, {
          mensaje: `mascota con indice ${data.indice} no encontrada`,
        });
      }
      callback(400, { mensaje: "indice no enviado" });
    },
  };
};
