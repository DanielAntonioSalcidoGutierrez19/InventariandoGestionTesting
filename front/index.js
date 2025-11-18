// Exportaremos las funciones que queremos testear
function setValidationState(group, message, state, text) {
  group.className = `form-group ${state}`;
  message.className = `validation-message ${state}`;
  message.textContent = text;
}

function validateUsername() {
  const input = document.getElementById("userId");
  const group = document.getElementById("userGroup");
  const message = document.getElementById("userMessage");
  const value = input.value.trim();

  if (value.length === 0) {
    setValidationState(group, message, "invalid", "El nombre de usuario es requerido");
    return false;
  }

  if (value.length < 3) {
    setValidationState(group, message, "invalid", "Mínimo 3 caracteres");
    return false;
  }

  setValidationState(group, message, "valid", "Usuario válido");
  return true;
}

function validatePassword() {
  const input = document.getElementById("password");
  const group = document.getElementById("passwordGroup");
  const message = document.getElementById("passwordMessage");
  const value = input.value.trim();

  if (value.length === 0) {
    setValidationState(group, message, "invalid", "La contraseña es requerida");
    return false;
  }

  if (value.length < 4) {
    setValidationState(group, message, "invalid", "Mínimo 4 caracteres");
    return false;
  }

  setValidationState(group, message, "valid", "Contraseña válida");
  return true;
}

function showSystemAlert(message, type = "error") {
  const alertBox = document.getElementById("systemAlert");
  alertBox.textContent = message;
  alertBox.className = `system-alert ${type}`;
  alertBox.style.display = "block";
}

function togglePassword() {
  const input = document.getElementById("password");
  const btn = document.getElementById("togglePassword");
  const type = input.getAttribute("type") === "password" ? "text" : "password";
  input.setAttribute("type", type);
  btn.textContent = type === "password" ? "👁️" : "🔒";
}

function updateLoginButton() {
  const validUser = validateUsername();
  const validPass = validatePassword();
  const loginBtn = document.getElementById("loginBtn");
  loginBtn.disabled = !(validUser && validPass);
}

module.exports = {
  validateUsername,
  validatePassword,
  showSystemAlert,
  togglePassword,
  updateLoginButton,
  setValidationState
};
