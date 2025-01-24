<?php
include_once 'app/models/TramitesModel.php';

class TramitesController {
    private $model;

    public function __construct() {
        $this->model = new TramitesModel();
    }

    // Crear un nuevo trámite
    public function createTramite($data) {
        $result = $this->model->create($data);
        return $result;
    }

    // Obtener todos los trámites
    public function getTramites() {
        $result = $this->model->getAll();
        return $result;
    }

    // Actualizar un trámite
    public function updateTramite($data) {
        $result = $this->model->update($data);
        return $result;
    }

    // Eliminar un trámite
    public function deleteTramite($data) {
        $result = $this->model->delete($data);
        return $result;
    }
}
?>