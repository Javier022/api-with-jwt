const jwt = require("jsonwebtoken");

const validateToken = (req, res, next) => {
  const token = req.header("auth-token");

  if (!token)
    return res.status(401).json({ error: true, message: "acceso denegado" });

  try {
    const verify = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verify;
    // estamos creando un request.user que puede ser utilizado en otras rutas
    next();
  } catch (error) {
    res.status(400).json({ error: true, message: "token invalido" });
  }
};

module.exports = validateToken;
