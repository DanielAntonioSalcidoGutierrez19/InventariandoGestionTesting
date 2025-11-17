// ===================================================
// PROTECCIÓN PARA JEST – DOM SE CARGA SOLO CUANDO EXISTE
// ===================================================
function safeGet(id) {
  return typeof document !== "undefined"
    ? document.getElementById(id)
    : null;
}

// ===================================================
// REFERENCIAS DEL DOM
// ===================================================
function getDOM() {
  return {
    userIdInput: safeGet("userId"),
    passwordInput: safeGet("password"),
    togglePasswordBtn: safeGet("togglePassword"),
    loginBtn: safeGet("loginBtn"),
    userGroup: safeGet("userGroup"),
    passwordGroup: safeGet("passwordGroup"),
    userMessage: safeGet("userMessage"),
    passwordMessage: safeGet("passwordMessage"),
    systemAlert: safeGet("systemAlert")
  };
}

// ===================================================
// ALERTA DEL SISTEMA
// ===================================================
function showSystemAlert(message, type = "error") {
  const { systemAlert } = getDOM();
  if (!systemAlert) return; // ← evita null en JEST

  systemAlert.textContent = message;
  systemAlert.className = `system-alert ${type}`;
  systemAlert.style.display = "block";

  setTimeout(() => {
    systemAlert.style.display = "none";
  }, 3500);
}

// ===================================================
// VALIDACIONES
// ===================================================
function validateUsername() {
  const { userIdInput, userGroup, userMessage } = getDOM();
  if (!userIdInput) return false;

  const value = userIdInput.value.trim();

  if (value.length === 0) {
    setValidationState(userGroup, userMessage, "invalid", "El nombre de usuario es requerido");
    return false;
  }
  if (value.length < 3) {
    setValidationState(userGroup, userMessage, "invalid", "Mínimo 3 caracteres");
    return false;
  }

  setValidationState(userGroup, userMessage, "valid", "Usuario válido");
  return true;
}

function validatePassword() {
  const { passwordInput, passwordGroup, passwordMessage } = getDOM();
  if (!passwordInput) return false;

  const value = passwordInput.value.trim();

  if (value.length === 0) {
    setValidationState(passwordGroup, passwordMessage, "invalid", "La contraseña es requerida");
    return false;
  }
  if (value.length < 4) {
    setValidationState(passwordGroup, passwordMessage, "invalid", "Mínimo 4 caracteres");
    return false;
  }

  setValidationState(passwordGroup, passwordMessage, "valid", "Contraseña válida");
  return true;
}

function setValidationState(group, message, state, text) {
  if (!group || !message) return; // ← evita null en Jest
  group.className = `form-group ${state}`;
  message.className = `validation-message ${state}`;
  message.textContent = text;
}

function updateLoginButton() {
  const { loginBtn } = getDOM();
  if (!loginBtn) return;

  const validUser = validateUsername();
  const validPass = validatePassword();

  loginBtn.disabled = !(validUser && validPass);
}

// ===================================================
// LOGIN
// ===================================================
async function login() {
  const {
    userIdInput,
    passwordInput,
    userGroup,
    passwordGroup,
    userMessage,
    passwordMessage,
    loginBtn
  } = getDOM();

  if (!userIdInput || !passwordInput) return;

  userGroup.classList.remove("invalid");
  passwordGroup.classList.remove("invalid");
  userMessage.textContent = "";
  passwordMessage.textContent = "";

  const nombre_usuario = userIdInput.value.trim();
  const contraseña = passwordInput.value.trim();

  try {
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre_usuario, contraseña }),
    });

    const data = await response.json();

    if (data.success) {
      const { id_usuario, rol } = data.user;

      localStorage.setItem("rol", rol);
      localStorage.setItem("id_usuario", String(id_usuario));

      showSystemAlert("Inicio de sesión correcto", "success");

      setTimeout(() => {
        if (rol === "admin") window.location.href = "Interfaz.html";
        else if (rol === "supervisor") window.location.href = "Interfazsupervisor.html";
        else if (rol === "cajero") window.location.href = "SistemaVentasCajero.html";
        else showSystemAlert("Rol no reconocido", "error");
      }, 800);

    } else {
      showSystemAlert("Usuario o contraseña incorrectos", "error");
      userIdInput.value = "";
      passwordInput.value = "";
      loginBtn.disabled = true;
    }

  } catch (error) {
    console.error("Error backend:", error);
    showSystemAlert("No se pudo conectar con el servidor Node", "error");
  }
}

// ===================================================
// INICIALIZACIÓN SOLO EN NAVEGADOR
// ===================================================
function initLoginPage() {
  const {
    userIdInput,
    passwordInput,
    togglePasswordBtn,
    loginBtn
  } = getDOM();

  if (!userIdInput || !passwordInput) return;

  userIdInput.value = "";
  passwordInput.value = "";
  localStorage.removeItem("rol");
  localStorage.removeItem("id_usuario");

  userIdInput.addEventListener("input", () => {
    validateUsername();
    updateLoginButton();
  });

  passwordInput.addEventListener("input", () => {
    validatePassword();
    updateLoginButton();
  });

  togglePasswordBtn.addEventListener("click", () => {
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    togglePasswordBtn.textContent = type === "password" ? "👁️" : "🔒";
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !loginBtn.disabled) login();
  });

  loginBtn.addEventListener("click", login);
}

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", initLoginPage);
}

// ===================================================
// EXPORTS PARA JEST
// ===================================================
module.exports = {
  validateUsername,
  validatePassword,
  updateLoginButton,
  login,
  initLoginPage,
  setValidationState,
  showSystemAlert
};
