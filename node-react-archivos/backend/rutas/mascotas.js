const {
  crear,
  obtenerUno,
  listar,
  actualizar,
  eliminar,
} = require("../data-handler");
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
    post: async (data, callback) => {
      if (data && data.payload && data.payload.id) {
        const resultado = await crear({
          directorioEntidad,
          nombreArchivo: data.payload.id,
          datosGuardar: data.payload,
        });
        return callback(201, resultado);
      }
      callback(400, {
        mensaje: "Hay un error, no se envió el payload o no se creó el id",
      });
    },

    put: async (data, callback) => {
      if (typeof data.indice !== "undefined") {
        const datosActuales = { ...data.payload, id: data.indice };
        const resultado = await actualizar({
          directorioEntidad: "mascotas",
          nombreArchivo: data.indice,
          datosActuales,
        });
        if (resultado.id) {
          return callback(200, resultado);
        }
        if (resultado.message) {
          return callback(404, {
            mensaje: `mascota con indice ${data.indice} no encontrada`,
          });
        }
        return callback(500, { mensaje: "Error al actualizar" });
      }
      callback(400, { mensaje: "Falta id" });
    },

    delete: async (data, callback) => {
      if (typeof data.indice !== "undefined") {
        const resultado = await eliminar({
          directorioEntidad: "mascotas",
          nombreArchivo: data.indice,
        });
        
        if (resultado.message) {
          return callback(404, {
            mensaje: `Mascota con indice ${data.indice} no encontrada`,
          });
        }
        if ( resultado.mensaje )
        {
          return callback(204);
        }
        return callback(500, { mensaje: "Error al actualizar" });
      }
      callback(400, { mensaje: "Falta id" });
    },
  };
};
