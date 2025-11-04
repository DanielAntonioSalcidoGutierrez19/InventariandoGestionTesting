import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const verificarToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token no proporcionado" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(403).json({ message: "Token inválido" });
  }
};

export const verificarRol = (rolesPermitidos = []) => {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    next();
  };
};
