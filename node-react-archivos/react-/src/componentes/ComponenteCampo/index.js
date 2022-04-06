import React from "react";
import Select from "../Select";
import Input from "../Input";

function ComponenteCampo({
  manejarInput = () => {},
  objeto = {},
  nombreCampo = "",
  options= {}
}) {
  switch (nombreCampo) {
    case "tipo":
    case "mascota":
    case "veterinaria":
    case "diagnostico":
    case "dueno":
      return (
        <div className="col">
          {options[nombreCampo].length > 0 ? (
            <Select
              nombreCampo={nombreCampo}
              options={options[nombreCampo]}
              onChange={manejarInput}
              placeholder={nombreCampo}
              value={objeto[nombreCampo]}
              defaultValue={objeto[nombreCampo]}
              selectedValue={objeto[nombreCampo]}
            />
          ) : (
            "cargando opciones..."
          )}
        </div>
      );
    case "nombre":
    case "apellido":
    case "dni":
    case "documento":
    case "historia":
      return (
        <div className="col">
          <Input
            nombreCampo={nombreCampo}
            tipo="text"
            onChange={manejarInput}
            placeholder={nombreCampo}
            value={objeto[nombreCampo]}
          />
        </div>
      );
    default:
      return false;
  }
}

export default ComponenteCampo;
