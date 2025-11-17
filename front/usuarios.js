// ======================
// Configuración
// ======================
const ADMIN_PASSWORD = "admin123";
const API_URL = "http://localhost:3000/api/usuarios";

// ======================
// Helper: Toast interno
// ======================
function showSystemWarning(message) {
  const warning = document.createElement("div");
  warning.className = "system-warning";
  warning.textContent = message;
  document.body.appendChild(warning);
  setTimeout(() => warning.remove(), 4000);
}

// ======================
// Helper: Validar contraseña admin (para tests)
// ======================
function isValidAdminPassword(input) {
  return input === ADMIN_PASSWORD;
}

// ======================
// Helper: Construir objetos de usuario (para POST/PUT)
// ======================
function buildNuevoUsuario(nombreCompleto, rol, correo, contraseña) {
  return {
    nombre_usuario: (correo || "").split("@")[0],
    nombre_completo: nombreCompleto,
    correo,
    contraseña,
    rol
  };
}

function buildUsuarioActualizado(nombreCompleto, correo, rol, nuevaPass) {
  const obj = { nombre_completo: nombreCompleto, correo, rol };
  if (nuevaPass && nuevaPass.length > 0) {
    obj.contraseña = nuevaPass;
  }
  return obj;
}

// ======================
// Crear tarjeta de usuario (DOM)
// ======================
function createUserCard(usuario) {
  const userCard = document.createElement("div");
  userCard.className = "user-card";
  userCard.setAttribute("data-id", usuario.id_usuario);
  userCard.setAttribute("data-email", usuario.correo);

  userCard.innerHTML = `
    <div class="user-role">${usuario.rol}</div>
    <div class="user-name">${usuario.nombre_completo}</div>
  `;

  userCard.addEventListener("click", function () {
    currentEditingUser = this;
    openPasswordConfirmModal();
  });

  return userCard;
}

// ======================
// Variables de estado
// ======================
let currentEditingUser = null;

// ======================
// Modales
// ======================
function openAddUserModal() {
  const modal = document.getElementById("addUserModal");
  const form = document.getElementById("addUserForm");
  if (form) form.reset();
  if (modal) modal.style.display = "flex";
}

function closeAddUserModal() {
  const modal = document.getElementById("addUserModal");
  if (modal) modal.style.display = "none";
}

function openPasswordConfirmModal() {
  const modal = document.getElementById("passwordConfirmModal");
  const form = document.getElementById("passwordConfirmForm");
  const error = document.getElementById("passwordError");
  const input = document.getElementById("adminPassword");

  if (form) form.reset();
  if (error) error.style.display = "none";
  if (modal) modal.style.display = "flex";
  if (input) input.focus();
}

function closePasswordConfirmModal() {
  const modal = document.getElementById("passwordConfirmModal");
  if (modal) modal.style.display = "none";
}

function openEditUserModal(userElement) {
  if (!userElement) return;

  const userId = userElement.getAttribute("data-id");
  const userName = userElement.querySelector(".user-name")?.textContent || "";
  const userRole = userElement.querySelector(".user-role")?.textContent || "";
  const userEmail = userElement.getAttribute("data-email") || "";

  const idInput = document.getElementById("editUserId");
  const nameInput = document.getElementById("editUserName");
  const roleInput = document.getElementById("editUserRole");
  const emailInput = document.getElementById("editUserEmail");
  const passInput = document.getElementById("editUserPassword");
  const modal = document.getElementById("editUserModal");

  if (idInput) idInput.value = userId;
  if (nameInput) nameInput.value = userName;
  if (roleInput) roleInput.value = userRole;
  if (emailInput) emailInput.value = userEmail;
  if (passInput) passInput.value = "";

  if (modal) modal.style.display = "flex";
  if (nameInput) nameInput.focus();
}

function closeEditUserModal() {
  const modal = document.getElementById("editUserModal");
  if (modal) modal.style.display = "none";
  currentEditingUser = null;
}

function openDeleteUserConfirmModal() {
  const modal = document.getElementById("deleteUserConfirmModal");
  if (modal) modal.style.display = "flex";
}

function closeDeleteUserConfirmModal() {
  const modal = document.getElementById("deleteUserConfirmModal");
  if (modal) modal.style.display = "none";
}

// ======================
// Cargar usuarios desde BD
// ======================
async function cargarUsuarios() {
  try {
    const response = await fetch(API_URL);
    const usuarios = await response.json();
    const usersGrid = document.getElementById("usersGrid");
    if (!usersGrid) return;

    usersGrid.innerHTML = "";

    usuarios.forEach((u) => {
      const card = createUserCard(u);
      usersGrid.appendChild(card);
    });
  } catch (error) {
    console.error("Error al cargar usuarios:", error);
    showSystemWarning("❌ Error al cargar usuarios");
  }
}

// ======================
// Agregar usuario
// ======================
async function handleAddUserSubmit(e) {
  e.preventDefault();

  const nombreCompleto = document.getElementById("userName").value.trim();
  const rol = document.getElementById("userRole").value;
  const correo = document.getElementById("userEmail").value.trim();
  const contraseña = document.getElementById("userPassword").value;

  const nuevoUsuario = buildNuevoUsuario(
    nombreCompleto,
    rol,
    correo,
    contraseña
  );

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoUsuario),
    });

    if (!res.ok) throw new Error();

    showSystemWarning("✅ Usuario agregado correctamente");
    closeAddUserModal();
    await cargarUsuarios();
  } catch (err) {
    console.error("Error al agregar usuario:", err);
    showSystemWarning("❌ Error al agregar usuario");
  }
}

// ======================
// Confirmar contraseña admin
// ======================
function handlePasswordConfirmSubmit(e) {
  e.preventDefault();
  const adminPassword = document.getElementById("adminPassword").value;
  const passwordError = document.getElementById("passwordError");

  if (isValidAdminPassword(adminPassword)) {
    if (passwordError) passwordError.style.display = "none";
    closePasswordConfirmModal();
    setTimeout(() => {
      if (currentEditingUser) openEditUserModal(currentEditingUser);
    }, 200);
  } else {
    if (passwordError) passwordError.style.display = "block";
    const input = document.getElementById("adminPassword");
    if (input) {
      input.value = "";
      input.focus();
    }
  }
}

// ======================
// Editar usuario
// ======================
async function handleEditUserSubmit(e) {
  e.preventDefault();

  const id = document.getElementById("editUserId").value;
  const nombre_completo = document.getElementById("editUserName").value.trim();
  const correo = document.getElementById("editUserEmail").value.trim();
  const rol = document.getElementById("editUserRole").value;
  const nuevaPass = document.getElementById("editUserPassword").value;

  const usuarioActualizado = buildUsuarioActualizado(
    nombre_completo,
    correo,
    rol,
    nuevaPass
  );

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usuarioActualizado),
    });

    if (!res.ok) throw new Error();

    showSystemWarning("✅ Usuario actualizado correctamente");
    closeEditUserModal();
    await cargarUsuarios();
  } catch (err) {
    console.error("Error al actualizar usuario:", err);
    showSystemWarning("❌ Error al actualizar usuario");
  }
}

// ======================
// Eliminar usuario
// ======================
async function handleDeleteUser() {
  const id = document.getElementById("editUserId").value;
  if (!id) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error();

    showSystemWarning("🗑️ Usuario eliminado correctamente");
    closeDeleteUserConfirmModal();
    closeEditUserModal();
    await cargarUsuarios();
  } catch (err) {
    console.error("Error al eliminar usuario:", err);
    showSystemWarning("❌ Error al eliminar usuario");
  }
}

// ======================
// Cerrar modales clic fuera
// ======================
function setupOutsideClickClose() {
  window.addEventListener("click", function (e) {
    ["addUserModal", "passwordConfirmModal", "editUserModal", "deleteUserConfirmModal"].forEach((id) => {
      const modal = document.getElementById(id);
      if (e.target === modal) modal.style.display = "none";
    });
  });
}

// ======================
// Inicializar eventos
// ======================
function initUsuariosPage() {
  const addUserForm = document.getElementById("addUserForm");
  const passwordConfirmForm = document.getElementById("passwordConfirmForm");
  const editUserForm = document.getElementById("editUserForm");
  const openDeleteUserConfirmBtn = document.getElementById("openDeleteUserConfirmBtn");
  const deleteUserBtn = document.getElementById("deleteUserBtn");

  if (addUserForm) {
    addUserForm.addEventListener("submit", handleAddUserSubmit);
  }
  if (passwordConfirmForm) {
    passwordConfirmForm.addEventListener("submit", handlePasswordConfirmSubmit);
  }
  if (editUserForm) {
    editUserForm.addEventListener("submit", handleEditUserSubmit);
  }
  if (openDeleteUserConfirmBtn) {
    openDeleteUserConfirmBtn.addEventListener("click", openDeleteUserConfirmModal);
  }
  if (deleteUserBtn) {
    deleteUserBtn.addEventListener("click", handleDeleteUser);
  }

  setupOutsideClickClose();
  cargarUsuarios();
}

// ======================
// Exponer funciones al HTML (onclick="...")
// ======================
window.openAddUserModal = openAddUserModal;
window.closeAddUserModal = closeAddUserModal;
window.closePasswordConfirmModal = closePasswordConfirmModal;
window.closeEditUserModal = closeEditUserModal;
window.closeDeleteUserConfirmModal = closeDeleteUserConfirmModal;

// ======================
// Inicializar cuando cargue el DOM (solo en navegador)
// ======================
if (typeof document !== "undefined" && typeof module === "undefined") {
  document.addEventListener("DOMContentLoaded", initUsuariosPage);
}

// ======================
// Exports para Jest (Node)
// ======================
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    ADMIN_PASSWORD,
    API_URL,
    showSystemWarning,
    isValidAdminPassword,
    buildNuevoUsuario,
    buildUsuarioActualizado,
    createUserCard
  };
}
