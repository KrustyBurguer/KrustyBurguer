const express = require('express');
const router = express.Router();
const PedidoProducto = require('../models/modelo-pedido-producto');
const autorizacion = require('../check-auth');

// * Añadir producto a un pedido
router.post('/', autorizacion, async (req, res, next) => {
  const { pedido, producto, cantidad, precio } = req.body;

  const total = cantidad * precio;

  const nuevoPedidoProducto = new PedidoProducto({
    pedido,
    producto,
    cantidad,
    precio,
    total
  });

  try {
    await nuevoPedidoProducto.save();
    res.status(201).json({ mensaje: "Producto añadido al pedido", pedidoProducto: nuevoPedidoProducto });
  } catch (error) {
    return res.status(500).json({ mensaje: "No se ha podido añadir el producto", error: error.message });
  }
});

// * Eliminar un producto de un pedido
router.delete('/:id', autorizacion, async (req, res, next) => {
  try {
    await PedidoProducto.findByIdAndDelete(req.params.id);
    res.status(200).json({ mensaje: "Producto eliminado del pedido" });
  } catch (error) {
    return res.status(500).json({ mensaje: "No se ha podido eliminar el producto", error: error.message });
  }
});

module.exports = router;
