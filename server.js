const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

app.use(cors());
app.use(express.json());

const rutasClientes = require('./routes/rutas-clientes-auth-token');
app.use('/api/clientes', rutasClientes);

const rutasProductos = require('./routes/rutas-productos');
app.use('/api/productos', rutasProductos);

const rutasPedidos = require('./routes/rutas-pedidos');
app.use('/api/pedidos', rutasPedidos);

const rutasPedidoProductos = require('./routes/rutas-pedidos-productos');
app.use('/api/pedido-productos', rutasPedidoProductos);



app.use((req, res, next) => {

  res.status(404);
  res.json({
    mensaje: "Información no encontrada",
  });
});

mongoose
  .connect(process.env.MONGO_DB_URI)
  .then(() => {
    console.log("💯 Conectado con éxito a Atlas");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🧏‍♀️ Escuchando en puerto ${process.env.PORT}`)
    );
  })
  .catch((error) => console.log(error));

