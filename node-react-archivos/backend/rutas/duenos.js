const {
  obtenerUno,
  crear,
  listar,
  actualizar,
  eliminar,
} = require("../data-handler");
const { palabraSinAcentos } = require("../util");
const directorioEntidad = "duenos";

module.exports = function duenosHandler(duenos) {
  return {
    get: async (data, callback) => {
      try {
        if (typeof data.indice !== "undefined") {
          const _dueno = await obtenerUno({
            directorioEntidad,
            nombreArchivo: data.indice,
          });

          if (_dueno && _dueno.id) {
            return callback(200, _dueno);
          }

          return callback(404, {
            mensaje: `Dueño con id ${data.indice} no encontradO`,
          }); // poniendo `` es un literal
        }
        const _duenos = await listar({
          directorioEntidad,
        });

        if (
          data.query &&
          (data.query.nombre || data.query.apellido || data.query.dni)
        ) {
          //creo un array con las llaves del objeto data query
          const llavesQuery = Object.keys(data.query);
          /* clono el array de duenoss que viene de reucursos  y este
           irá guardando los resultados */
          let respuestaDuenos = [..._duenos];

          /* filtro el array de respuestas con el index solamente dejar
            los objetos de duenos que cumplen con la búsqueda */
          respuestaDuenos = respuestaDuenos.filter((_dueno) => {
            let resultado = false;
            /* recorro cada una de las llaves con el fin de filtrar
            según los criterios de búsqueda */
            for (const llave of llavesQuery) {
              const busqueda = palabraSinAcentos(data.query[llave]);

              /*  creo una expresión regular para que la búsqueda
              devuelva el resultado aunque sea may. o min. o partes parciales
              de una palabra poniendo el ig ej: mar de marta*/
              const expresionRegular = new RegExp(busqueda, "ig");
              const campoDuenoSinAcentos = palabraSinAcentos(_dueno[llave]);
              /*  resultado guarda la verificación del string del criterio de
              búsqueda y los objetos de duenos, nos dice si el criterio está
              o no, en el objeto de duenos que estamos evaluando en el momento */
              resultado = campoDuenoSinAcentos.match(expresionRegular);
              if (resultado) {
                break;
              }
            }
            /* el resultado entrega null cuando no encuentra  el criterio de
              búsqueda, null es falso por lo tanto el filter ignorará el resultado
              === null, y los que si tengan el criterio de búsqueda entran en el 
              array de respuestaduenos  */
            return resultado;
          });
          return callback(200, respuestaDuenos);
        }
        callback(200, _duenos);
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
          directorioEntidad,
          nombreArchivo: data.indice,
          datosActuales,
        });
        if (resultado.id) {
          return callback(200, resultado);
        }
        return callback(404, {
          mensaje: `Dueño con indice ${data.indice} no encontrado`,
        });
      }

      callback(400, { mensaje: "Falta id" });
    },
    delete: async (data, callback) => {
      if (typeof data.indice !== "undefined") {
        const resultado = await eliminar({
          directorioEntidad,
          nombreArchivo: data.indice,
        });
        if (resultado.message) {
          return callback(404, {
            mensaje: `Dueño con id ${data.indice} no encontrado`,
          });
        }
        if (resultado.mensaje) {
          return callback(204);
        }
        return callback(500, { mensaje: "Error al actualizar" });
      }

      callback(400, { mensaje: "Falta id" });
    },
  };
};
