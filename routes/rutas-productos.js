const express = require("express");
const router = express.Router();
const Producto = require("../models/modelo-producto");
const autorizacion = require("../check-auth");

// * Listar todos los productos
router.get("/", async (req, res, next) => {
  let productos;
  try {
    productos = await Producto.find({});
    res.status(200).json({ productos });
  } catch (err) {
    return res
      .status(500)
      .json({
        mensaje: "No se ha podido recuperar los productos",
        error: err.message,
      });
  }
});

router.get("/:categoria", async (req, res, next) => {
  const { categoria } = req.params;

  try {
    const productos = await Producto.find({ categoria });
    if (productos.length === 0) {
      return res.status(404).json({ mensaje: "No se encontraron productos para esta categoría" });
    }
    res.status(200).json({ productos });
  } catch (err) {
    return res.status(500).json({
      mensaje: "No se ha podido recuperar los productos",
      error: err.message,
    });
  }
});

// * Crear nuevo producto
router.post("/", async (req, res, next) => {
  const { nombre, descripcion, precio, categoria, foto } = req.body; 
  const nuevoProducto = new Producto({
    nombre,
    descripcion,
    precio,
    categoria,
    foto,
  });

  try {
    await nuevoProducto.save();
    res
      .status(201)
      .json({ mensaje: "Producto creado", producto: nuevoProducto });
  } catch (error) {
    return res
      .status(500)
      .json({
        mensaje: "No se ha podido crear el producto",
        error: error.message,
      });
  }
});


// * Modificar un producto
router.put("/:id",  async (req, res, next) => {
  const { nombre, descripcion, precio, categoria, foto, disponible, } = req.body;

  try {
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      { nombre, descripcion, precio, categoria, foto },
      { new: true, runValidators: true }
    );
    res.status(200).json({ mensaje: "Producto actualizado", producto });
  } catch (error) {
    return res
      .status(404)
      .json({
        mensaje: "No se ha podido actualizar el producto",
        error: error.message,
      });
  }
});

// * Eliminar un producto
router.delete("/:id", async (req, res, next) => {
  try {
    await Producto.findByIdAndDelete(req.params.id);
    res.status(200).json({ mensaje: "Producto eliminado" });
  } catch (error) {
    return res
      .status(500)
      .json({
        mensaje: "No se ha podido eliminar el producto",
        error: error.message,
      });
  }
});

module.exports = router;
