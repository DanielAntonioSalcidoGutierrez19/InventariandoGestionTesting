import pool from "../db/connection.js";
import bcrypt from "bcrypt"; // npm install bcrypt

// 🔹 Controlador de login
export const login = async (req, res) => {
  const { nombre_usuario, contraseña } = req.body;

  try {
    // Verifica que se envíen datos
    if (!nombre_usuario || !contraseña) {
      return res.status(400).json({ success: false, message: "Faltan credenciales" });
    }

    // Busca el usuario en la base de datos
    const [rows] = await pool.query(
      "SELECT * FROM usuarios WHERE nombre_usuario = ? LIMIT 1",
      [nombre_usuario]
    );

    if (rows.length === 0) {
      return res.json({ success: false, message: "Usuario no encontrado" });
    }

    const user = rows[0];

    // Validar contraseña (bcrypt)
    const passwordMatch =
      user.contraseña.startsWith("$2b$")
        ? await bcrypt.compare(contraseña, user.contraseña)
        : user.contraseña === contraseña;

    if (!passwordMatch) {
      return res.json({ success: false, message: "Contraseña incorrecta" });
    }

    // Éxito
    res.json({
      success: true,
      message: "Inicio de sesión exitoso ✅",
      user: {
        id_usuario: user.id_usuario,
        nombre_usuario: user.nombre_usuario,
        rol: user.rol // <--- IMPORTANTE
      },
    });
  } catch (error) {
    console.error("❌ Error en login:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
};
