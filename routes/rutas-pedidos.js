const express = require('express');
const router = express.Router();
const Pedido = require('../models/modelo-pedido');
const autorizacion = require('../check-auth');

// Listar todos los pedidos
router.get('/', autorizacion, async (req, res, next) => {
  try {
    const pedidos = await Pedido.find().populate('cliente productos.producto');
    console.log("Pedidos obtenidos: ", pedidos);
    res.status(200).json({ pedidos });
  } catch (err) {
    console.error("Error al obtener pedidos: ", err);
    res.status(500).json({ mensaje: "No se ha podido recuperar los pedidos", error: err.message });
  }
});

// Crear un nuevo pedido
router.post('/', autorizacion, async (req, res, next) => {
  const { cliente, productos, total } = req.body;
  const nuevoPedido = new Pedido({ cliente, productos, total });
  try {
    await nuevoPedido.save();
    console.log("Pedido creado: ", nuevoPedido);
    res.status(201).json({ mensaje: "Pedido creado", pedido: nuevoPedido });
  } catch (error) {
    console.error("Error al crear pedido: ", error);
    res.status(500).json({ mensaje: "No se ha podido crear el pedido", error: error.message });
  }
});

// Actualizar el estado de un pedido
router.put('/:id', autorizacion, async (req, res, next) => {
  const { estado } = req.body;
  try {
    const pedido = await Pedido.findByIdAndUpdate(req.params.id, { estado }, { new: true });
    console.log("Pedido actualizado: ", pedido);
    res.status(200).json({ mensaje: "Pedido actualizado", pedido });
  } catch (error) {
    console.error("Error al actualizar pedido: ", error);
    res.status(500).json({ mensaje: "No se ha podido actualizar el pedido", error: error.message });
  }
});

// Eliminar un pedido
router.delete('/:id', autorizacion, async (req, res, next) => {
  try {
    await Pedido.findByIdAndDelete(req.params.id);
    console.log("Pedido eliminado");
    res.status(200).json({ mensaje: "Pedido eliminado" });
  } catch (error) {
    console.error("Error al eliminar pedido: ", error);
    res.status(500).json({ mensaje: "No se ha podido eliminar el pedido", error: error.message });
  }
});

module.exports = router;

