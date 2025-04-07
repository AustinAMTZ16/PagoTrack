<?php
include_once 'app/models/Oficios/OficiosModel.php';

class OficiosController {
    private $model;

    public function __construct() {
        $this->model = new OficiosModel();
    }

    public function listarOficios() {
        return $this->model->listarOficios();
    }

    public function crearOficio($data){
        return $this->model->crearOficio($data);
    }

    public function actualizarOficio($data){
        return $this->model->actualizarOficio($data);
    }

    public function eliminarOficio($id){
        return $this->model->eliminarOficio($id);
    }   
}   
?>