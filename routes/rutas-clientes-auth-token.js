const { response } = require("express");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

const autorizacion = require("../check-auth");
const Cliente = require("../models/modelo-cliente");

// * Listar todos los clientes (solo admin)
router.get("/", autorizacion, async (req, res, next) => {
  // Verificar si es admin
  if (!req.userData.isAdmin) {
    return res.status(403).json({ mensaje: "Acceso denegado. Solo admin." });
  }

  let clientes;
  try {
    clientes = await Cliente.find({});
  } catch (err) {
    const error = new Error("Ha ocurrido un error en la recuperación de datos");
    error.code = 500;
    return next(error);
  }
  res.status(200).json({
    mensaje: "Clientes registrados",
    clientes: clientes,
  });
});

// * Listar un cliente (admin o cliente mismo)
router.get("/:id", autorizacion, async (req, res, next) => {
  const idCliente = req.params.id;

  // Verificar si es admin o si está consultando su propio perfil
  if (req.userData.userId !== idCliente && !req.userData.isAdmin) {
    return res.status(403).json({ mensaje: "Acceso denegado." });
  }

  let cliente;
  try {
    cliente = await Cliente.findById(idCliente);
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido recuperar los datos"
    );
    error.code = 500;
    return next(error);
  }
  if (!cliente) {
    const error = new Error(
      "No se ha podido encontrar el cliente con el id proporcionado"
    );
    error.code = 404;
    return next(error);
  }
  res.json({
    mensaje: "Cliente encontrado",
    cliente: cliente,
  });
});

// Crear nuevo cliente
router.post("/", async (req, res, next) => {
  const { nombre, email, password, isAdmin } = req.body; // Añadimos isAdmin aquí

  let existeCliente;
  try {
    existeCliente = await Cliente.findOne({ email: email });
  } catch (err) {
    const error = new Error(err);
    error.code = 500;
    return next(error);
  }

  if (existeCliente) {
    const error = new Error("Ya existe un cliente con ese e-mail.");
    error.code = 401;
    return next(error);
  } else {
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (error) {
      const err = new Error("No se ha podido crear el usuario.");
      err.code = 500;
      return next(err);
    }

    const nuevoCliente = new Cliente({
      nombre,
      email,
      password: hashedPassword,
      isAdmin: isAdmin || false // Asegúrate de que isAdmin se guarda correctamente
    });

    try {
      await nuevoCliente.save();
    } catch (error) {
      const err = new Error("No se han podido guardar los datos");
      err.code = 500;
      return next(err);
    }

    let token;
    try {
      token = jwt.sign(
        {
          userId: nuevoCliente.id,
          email: nuevoCliente.email,
          isAdmin: nuevoCliente.isAdmin // Añadimos isAdmin al token
        },
        "clave_secreta",
        { expiresIn: "2h" }
      );
    } catch (error) {
      const err = new Error("El proceso de alta ha fallado");
      err.code = 500;
      return next(error);
    }

    res.status(201).json({
      userId: nuevoCliente.id,
      email: nuevoCliente.email,
      token: token,
      isAdmin: nuevoCliente.isAdmin // Incluimos isAdmin en la respuesta
    });
  }
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  let clienteExiste;
  try {
    clienteExiste = await Cliente.findOne({ email: email });
  } catch (error) {
    const err = new Error("No se ha podido realizar la operación");
    err.code = 500;
    return next(err);
  }

  if (!clienteExiste) {
    const err = new Error("No se ha podido identificar el cliente. Credenciales erróneas");
    err.code = 422;
    return next(err);
  } else {
    let esValidoPassword = bcrypt.compareSync(password, clienteExiste.password);
    if (!esValidoPassword) {
      const error = new Error("No se ha podido identificar al usuario. Credenciales erróneas");
      error.code = 401;
      return next(error);
    }

    let token;
    try {
      token = jwt.sign(
        {
          userId: clienteExiste.id,
          email: clienteExiste.email,
          isAdmin: clienteExiste.isAdmin || false // Añadimos isAdmin al token
        },
        "clave_secreta",
        { expiresIn: "2h" }
      );
    } catch (error) {
      const err = new Error("El proceso de login ha fallado");
      err.code = 500;
      return next(error);
    }

    res.status(201).json({
      mensaje: "El cliente ha entrado con éxito en el sistema",
      userId: clienteExiste.id,
      email: clienteExiste.email,
      token: token,
      isAdmin: clienteExiste.isAdmin || false 
    });
  }
});

// * Modificar password del cliente (admin o cliente mismo)
router.put("/:id", autorizacion, async (req, res, next) => {
  const idCliente = req.params.id;

  if (req.userData.userId !== idCliente && !req.userData.isAdmin) {
    return res.status(403).json({ mensaje: "Acceso denegado." });
  }

  const cambiarPassword = req.body.password;
  let clienteBuscar;
  try {
    clienteBuscar = await Cliente.findById(idCliente);
    if (!clienteBuscar) {
      return res.status(404).json({ mensaje: "Cliente no encontrado." });
    }

    // Hashear la nueva contraseña
    clienteBuscar.password = await bcrypt.hash(cambiarPassword, 12);

    await clienteBuscar.save();
  } catch (error) {
    res.status(404).json({
      mensaje: "No se ha podido actualizar la contraseña del cliente",
      error: error.message,
    });
  }
  res.status(200).json({
    mensaje: "Contraseña modificada",
    cliente: clienteBuscar,
  });
});

// * Eliminar cliente (solo admin)
router.delete("/:id", autorizacion, async (req, res, next) => {
  if (!req.userData.isAdmin) {
    return res.status(403).json({ mensaje: "Acceso denegado. Solo admin." });
  }

  let cliente;
  try {
    cliente = await Cliente.findByIdAndDelete(req.params.id);
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido eliminar los datos"
    );
    error.code = 500;
    return next(error);
  }
  res.json({
    mensaje: "Cliente eliminado",
    cliente: cliente,
  });
});

module.exports = router;
