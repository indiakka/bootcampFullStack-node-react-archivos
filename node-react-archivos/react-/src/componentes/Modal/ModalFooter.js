import React from "react";
import "./ModalFooter.css";

function ModalFooter({ cambiarModal = () => {}, crearEntidad = () => {} }) {
  return (
    <div className="modal-footer">
      <button
        onClick={cambiarModal}
        type="button"
        className="btn btn-secondary"
        data-dismiss="modal"
      >
        Cerrar
      </button>
      <button
        onClick={crearEntidad}
        id="btn-guardar"
        data-dismiss="modal"
        type="button"
        className="btn btn-primary"
      >
        Guardar
      </button>
    </div>
  );
}

export default ModalFooter;
