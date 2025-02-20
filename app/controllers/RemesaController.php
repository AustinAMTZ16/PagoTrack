<?php
include_once 'app/models/RemesaModel.php';

class RemesaController {
    private $model;

    public function __construct() {
        $this->model = new RemesaModel();
    }

    // Crear una nueva remesa
    public function createRemesa($data) {
        $result = $this->model->create($data);
        return $result;
    }

    // Obtener todas las remesas
    public function getRemesas() {
        $result = $this->model->getAll();
        return $result;
    }

    // Actualizar una remesa
    public function updateRemesa($data) {
        $result = $this->model->update($data);
        return $result;
    }

    // Eliminar una remesa
    public function deleteRemesa($data) {
        $result = $this->model->delete($data);
        return $result;
    }

    // Obtener las remesas con trámites
    public function getRemesasWithTramites() {
        $result = $this->model->getRemesasWithTramites();
        return $result;
    }   

    // Actualizar trámite y remesa
    public function updateTramiteRemesa($data) {
        $result = $this->model->updateTramiteRemesa($data);
        return $result;
    }   
}
?>