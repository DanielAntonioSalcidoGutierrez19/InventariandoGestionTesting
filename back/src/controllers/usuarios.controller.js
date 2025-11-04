import bcrypt from "bcrypt";
import pool from "../db/connection.js";

// ✅ Obtener todos los usuarios
export const getUsuarios = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id_usuario, nombre_usuario, nombre_completo, correo, rol, fecha_creacion FROM usuarios"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

// ✅ Obtener un usuario por ID
export const getUsuarioById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE id_usuario = ?", [id]);
    if (rows.length === 0)
      return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuario" });
  }
};

// ✅ Crear un nuevo usuario
export const createUsuario = async (req, res) => {
  const { nombre_usuario, nombre_completo, correo, contraseña, rol } = req.body;
  try {
    const hashed = await bcrypt.hash(contraseña, 10);
    const [result] = await pool.query(
      "INSERT INTO usuarios (nombre_usuario, nombre_completo, correo, contraseña, rol, fecha_creacion) VALUES (?, ?, ?, ?, ?, NOW())",
      [nombre_usuario, nombre_completo, correo, hashed, rol]
    );
    res.status(201).json({ id: result.insertId, nombre_usuario, rol });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ message: "Error al crear usuario" });
  }
};

// ✅ Actualizar usuario (con cambio de contraseña opcional)
export const updateUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre_completo, correo, rol, contraseña } = req.body;

  try {
    const [usuarioExistente] = await pool.query(
      "SELECT * FROM usuarios WHERE id_usuario = ?",
      [id]
    );
    if (usuarioExistente.length === 0)
      return res.status(404).json({ message: "Usuario no encontrado" });

    let query = "UPDATE usuarios SET nombre_completo=?, correo=?, rol=?";
    const params = [nombre_completo, correo, rol];

    if (contraseña && contraseña.trim() !== "") {
      const hashed = await bcrypt.hash(contraseña, 10);
      query += ", contraseña=?";
      params.push(hashed);
    }

    query += " WHERE id_usuario=?";
    params.push(id);

    await pool.query(query, params);
    res.json({ message: "✅ Usuario actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ message: "Error al actualizar usuario" });
  }
};

// ✅ Eliminar usuario
export const deleteUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM usuarios WHERE id_usuario = ?", [id]);
    res.json({ message: "🗑️ Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ message: "Error al eliminar usuario" });
  }
};

