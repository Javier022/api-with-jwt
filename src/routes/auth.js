const router = require("express").Router();

// jwt
const jwt = require("jsonwebtoken");

// validar campos requeridos
const Joi = require("@hapi/joi");

// importacion de modelo de  mongo DB
const User = require("../models/User");

// hashar password
const bcrypt = require("bcrypt");

const schemaRegister = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  email: Joi.string().min(6).max(255).required().email(),
  password: Joi.string().min(6).max(255).required(),
});

const schemaLogin = Joi.object({
  email: Joi.string().min(6).max(255).required().email(),
  password: Joi.string().min(3).max(255).required(),
});

router.post("/login", async (req, res) => {
  const { error } = schemaLogin.validate(req.body);

  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
    });
  }

  const verifyUser = await User.findOne({
    email: req.body.email,
  });

  if (!verifyUser) {
    return res.status(400).json({
      error: true,
      message: "Usuario no encontrado",
    });
  }

  const passValida = await bcrypt.compare(
    req.body.password,
    verifyUser.password
  );

  if (!passValida) {
    return res.status(400).json({
      error: true,
      message: "Bad password",
    });
  }

  const token = jwt.sign(
    {
      name: verifyUser.name,
      id: verifyUser._id,
    },
    process.env.TOKEN_SECRET
  );

  res.header("auth-token", token).json({
    error: null,
    data: { token },
  });
});

router.post("/register", async (req, res) => {
  // Validaciones de usuario

  const { error } = schemaRegister.validate(req.body);

  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
    });
  }

  const existeElEmail = await User.findOne({
    email: req.body.email,
  });

  if (existeElEmail) {
    return res.status(400).json({
      error: true,
      message: "Email ya registrado",
    });
  }

  // hash password
  const salt = await bcrypt.genSalt(10);
  const passEncrypt = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: passEncrypt,
  });

  try {
    const userDB = await user.save();

    res.json({
      error: null,
      data: userDB,
    });
  } catch (error) {
    res.status(404).json(error);
  }
});

module.exports = router;
