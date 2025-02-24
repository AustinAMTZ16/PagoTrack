<?php
include_once 'app/models/SuficienciaModel.php';

class SuficienciaController {
    private $model;

    public function __construct() {
        $this->model = new SuficienciaModel();
    }
    // Función para obtener las Suficiencias
    public function getSuficiencias() {
        $result = $this->model->getSuficiencias();
        return $result;
    }
}
?>