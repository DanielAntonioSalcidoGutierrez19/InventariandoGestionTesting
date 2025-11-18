/**
 * @jest-environment jsdom
 */

const {
  validateUsername,
  validatePassword,
  showSystemAlert,
  togglePassword,
  updateLoginButton,
  setValidationState
} = require("../front/index.js");

beforeEach(() => {
  document.body.innerHTML = `
    <div id="systemAlert" class="system-alert"></div>

    <div id="userGroup" class="form-group">
      <input id="userId" />
      <div id="userMessage" class="validation-message"></div>
    </div>

    <div id="passwordGroup" class="form-group">
      <input id="password" type="password" />
      <button id="togglePassword">👁️</button>
      <div id="passwordMessage" class="validation-message"></div>
    </div>

    <button id="loginBtn" disabled>INICIAR</button>
  `;
});

// ===================================================
// 1. Validación usuario vacío
// ===================================================
test("validateUsername marca inválido cuando está vacío", () => {
  document.getElementById("userId").value = "";

  expect(validateUsername()).toBe(false);
  expect(document.getElementById("userMessage").textContent)
    .toBe("El nombre de usuario es requerido");
});

// ===================================================
// 2. Validación usuario corto (menos de 3)
// ===================================================
test("validateUsername marca inválido si tiene menos de 3 caracteres", () => {
  document.getElementById("userId").value = "ed";

  expect(validateUsername()).toBe(false);
  expect(document.getElementById("userMessage").textContent)
    .toBe("Mínimo 3 caracteres");
});

// ===================================================
// 3. Validación usuario correcto
// ===================================================
test("validateUsername marca válido con nombre correcto", () => {
  document.getElementById("userId").value = "eduardo";

  expect(validateUsername()).toBe(true);
  expect(document.getElementById("userMessage").textContent)
    .toBe("Usuario válido");
});

// ===================================================
// 4. Validación contraseña vacía
// ===================================================
test("validatePassword falla cuando está vacía", () => {
  document.getElementById("password").value = "";

  expect(validatePassword()).toBe(false);
  expect(document.getElementById("passwordMessage").textContent)
    .toBe("La contraseña es requerida");
});

// ===================================================
// 5. Validación contraseña mínima
// ===================================================
test("validatePassword falla si es menor a 4 caracteres", () => {
  document.getElementById("password").value = "123";

  expect(validatePassword()).toBe(false);
  expect(document.getElementById("passwordMessage").textContent)
    .toBe("Mínimo 4 caracteres");
});

// ===================================================
// 6. Mostrar alerta del sistema
// ===================================================
test("showSystemAlert muestra correctamente mensaje y tipo", () => {
  showSystemAlert("Error grave", "error");

  const alert = document.getElementById("systemAlert");
  expect(alert.textContent).toBe("Error grave");
  expect(alert.className).toBe("system-alert error");
  expect(alert.style.display).toBe("block");
});

// ===================================================
// 7. Alternar visibilidad de contraseña
// ===================================================
test("togglePassword alterna entre text/password", () => {
  const input = document.getElementById("password");
  const btn = document.getElementById("togglePassword");

  togglePassword();
  expect(input.type).toBe("text");
  expect(btn.textContent).toBe("🔒");

  togglePassword();
  expect(input.type).toBe("password");
  expect(btn.textContent).toBe("👁️");
});

// ===================================================
// 8. updateLoginButton habilita botón si validaciones pasan
// ===================================================
test("updateLoginButton habilita botón cuando usuario y password válidos", () => {
  document.getElementById("userId").value = "eduardo";
  document.getElementById("password").value = "1234";

  updateLoginButton();

  expect(document.getElementById("loginBtn").disabled).toBe(false);
});
