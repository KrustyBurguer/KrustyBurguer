const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  address: String,
  isAdmin: { type: Boolean, default: false }, 
  pedidos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pedido' }], 
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cliente', clienteSchema);
