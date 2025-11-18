// cypress/e2e/index.cy.js

describe("Página de Login - Inventariando", () => {

  beforeEach(() => {
    // Ajusta la ruta según donde está tu proyecto en local
    cy.visit("http://localhost/inventariando/index.html");
  });

  // ============================
  // 1. Usuario vacío
  // ============================
  it("Muestra error cuando el usuario está vacío", () => {
    cy.get("#userId").clear();
    cy.get("#password").type("12345");

    cy.get("#userId").blur(); // dispara validación

    cy.get("#userMessage")
      .should("contain", "El nombre de usuario es requerido");
  });

  // ============================
  // 2. Usuario menor de 3 chars
  // ============================
  it("Muestra error si el usuario es menor a 3 caracteres", () => {
    cy.get("#userId").type("ed");
    cy.get("#userId").blur();

    cy.get("#userMessage").should("contain", "Mínimo 3 caracteres");
  });

  // ============================
  // 3. Usuario válido
  // ============================
  it("Marca usuario válido cuando tiene 3+ caracteres", () => {
    cy.get("#userId").type("eduardo");
    cy.get("#userMessage").should("contain", "Usuario válido");
  });

  // ============================
  // 4. Contraseña vacía
  // ============================
  it("Muestra error cuando la contraseña está vacía", () => {
    cy.get("#password").clear();
    cy.get("#password").blur();

    cy.get("#passwordMessage")
      .should("contain", "La contraseña es requerida");
  });

  // ============================
  // 5. Contraseña corta
  // ============================
  it("Muestra error si la contraseña es menor a 4 caracteres", () => {
    cy.get("#password").type("123");
    cy.get("#password").blur();

    cy.get("#passwordMessage").should("contain", "Mínimo 4 caracteres");
  });

  // ============================
  // 6. Contraseña válida
  // ============================
  it("Marca contraseña válida cuando cumple requisitos", () => {
    cy.get("#password").type("1234");
    cy.get("#passwordMessage").should("contain", "Contraseña válida");
  });

  // ============================
  // 7. Toggle password 👁️
  // ============================
  it("Alterna visibilidad de contraseña con el botón", () => {
    cy.get("#password").type("1234");
    cy.get("#togglePassword").click();

    cy.get("#password").should("have.attr", "type", "text");

    cy.get("#togglePassword").click();

    cy.get("#password").should("have.attr", "type", "password");
  });

  // ============================
  // 8. Botón de login habilitado
  // ============================
  it("Habilita el botón de login solo si usuario y pass son válidos", () => {
    cy.get("#userId").type("eduardo");
    cy.get("#password").type("1234");

    cy.get("#loginBtn").should("not.be.disabled");
  });

  // ============================
  // 9. Login fallido (mock request)
  // ============================
  it("Muestra error cuando el backend responde con credenciales inválidas", () => {
    cy.intercept("POST", "/api/auth/login", {
      statusCode: 200,
      body: { success: false }
    });

    cy.get("#userId").type("eduardo");
    cy.get("#password").type("1234");
    cy.get("#loginBtn").click();

    cy.get("#systemAlert").should("contain", "Usuario o contraseña incorrectos");
  });

  // ============================
  // 10. Login correcto (mockeado)
  // ============================
  it("Redirige correctamente según el rol cuando el login es exitoso", () => {
    cy.intercept("POST", "/api/auth/login", {
      statusCode: 200,
      body: {
        success: true,
        user: {
          id_usuario: 1,
          rol: "admin"
        }
      }
    });

    cy.get("#userId").type("adminuser");
    cy.get("#password").type("1234");
    cy.get("#loginBtn").click();

    cy.wait(900); // tiempo del setTimeout del script

    cy.url().should("include", "Interfaz.html");
  });

});
