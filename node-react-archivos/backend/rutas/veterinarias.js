const {
  crear,
  obtenerUno,
  listar,
  actualizar,
  eliminar,
} = require("../data-handler");
const directorioEntidad = "veterinarias";
const { palabraSinAcentos } = require("../util");

module.exports = function veterinariasHandler(veterinarias) {
  return {
    get: async (data, callback) => {
      console.log("handler veterinarias", { data });
      try {
        if (typeof data.indice !== "undefined") {
          const _veterinaria = await obtenerUno({
            directorioEntidad,
            nombreArchivo: data.indice,
          });

          if (_veterinaria && _veterinaria.id) {
            return callback(200, _veterinaria);
          }

          return callback(404, {
            mensaje: `Veterinaria con id ${data.indice} no encontrado`,
          });
        }

        const _veterinarias = await listar({
          directorioEntidad: "veterinarias",
        });
        if (
          data.query &&
          (data.query.nombre || data.query.apellido || data.query.documento)
        ) {
          //creo un array con las llaves del objeto data query
          const llavesQuery = Object.keys(data.query);
          /* clono el array de veterinarias que viene de reucursos  y este
         irá guardando los resultados */
          let respuestaVeterinarias = [...veterinarias];
          /* filtro el array de respuestas con el index solamente dejar
          los objetos de veterinaria que cumplen con la búsqueda */
          respuestaVeterinarias = respuestaVeterinarias.filter(
            (_veterinaria) => {
              let resultado = false;

              /* recorro cada una de las llaves con el fin de filtrar
        según los criterios de búsqueda */
              for (const llave of llavesQuery) {
                // Quitamos los acentos a las palabras que los tienen
                const busqueda = palabraSinAcentos(data.query[llave]);
                /*  creo una expresión regular para que la búsqueda
            devuelva el resultado aunque sea may. o min. o partes parciales
            de una palabra poniendo el ig ej: mar de marta*/
                const expresionRegular = new RegExp(busqueda, "ig");
                const campoVeterinariaSinAcentos = palabraSinAcentos(
                  _veterinaria[llave]
                );
                /* resultado  guarda la verificación de la expresión regular en cada uno de los campos
              búsqueda y los objetos de mascota, nos dice si el criterio está
            o no, en el objeto de mascota que estamos evaluando en el momento */
                resultado = campoVeterinariaSinAcentos.match(expresionRegular);
                /* si resultado es diferente a falso o null (.match entrega null cuando 
            no hay match) entonces rompemos (break) el ciclo for */
                if (resultado) {
                  break;
                }
              }
              /* null es falso por lo tanto el filter ignorará resultado === null
           y los que si tengan el criterio de búsqueda entran al array respuestaMascotas */
              return resultado;
            }
          );

          return callback(200, respuestaVeterinarias);
        }
        callback(200, _veterinarias);
      } catch (error) {
        if (error) {
          console.log(error);
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

        if (resultado.message) {
          return callback(404, {
            mensaje: `Veterinaria con indice ${data.indice} no encontrada`,
          });
        }
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
            mensaje: `Veterinaria con id ${data.indice} no encontrado`,
          });
        }

        if (resultado.mensaje) {
          return callback(204);
        }

        return callback(500, { mensaje: "Error al eliminar" });
      }
      callback(400, { mensaje: "Falta id" });
    },
  };
};
