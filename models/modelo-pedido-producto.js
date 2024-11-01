const mongoose = require('mongoose');

const pedidoProductoSchema = new mongoose.Schema({
  pedido: { type: mongoose.Schema.Types.ObjectId, ref: 'Pedido', required: true },
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true }, 
  cantidad: { type: Number, required: true }, 
  precio: { type: Number, required: true }, 
  total: { type: Number, required: true }, 
});

module.exports = mongoose.model('PedidoProducto', pedidoProductoSchema);