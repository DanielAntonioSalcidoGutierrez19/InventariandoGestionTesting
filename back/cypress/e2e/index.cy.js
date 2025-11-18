describe("Página de Login - Inventariando", () => {
  beforeEach(() => {
    cy.visit("http://localhost/inventariando3/index.html");
  });

  // ============================
  // 1. Usuario vacío
  // ============================
  it("Muestra error cuando el usuario está vacío", () => {
    cy.get("#userId").clear().type(" ").clear(); // fuerza input
    cy.get("#userMessage").should("contain", "El nombre de usuario es requerido");
  });

  // ============================
  // 2. Usuario menor a 3 chars
  // ============================
  it("Muestra error si el usuario es menor a 3 caracteres", () => {
    cy.get("#userId").clear().type("ed");
    cy.get("#userMessage").should("contain", "Mínimo 3 caracteres");
  });

  // ============================
  // 3. Usuario válido
  // ============================
  it("Marca usuario válido cuando tiene 3+ caracteres", () => {
    cy.get("#userId").clear().type("eduardo");
    cy.get("#userMessage").should("contain", "Usuario válido");
  });

  // ============================
  // 4. Contraseña vacía
  // ============================
  it("Muestra error cuando la contraseña está vacía", () => {
    cy.get("#password").clear().type(" ").clear();
    cy.get("#passwordMessage").should("contain", "La contraseña es requerida");
  });

  // ============================
  // 5. Contraseña corta
  // ============================
  it("Muestra error si la contraseña es menor a 4 caracteres", () => {
    cy.get("#password").clear().type("123");
    cy.get("#passwordMessage").should("contain", "Mínimo 4 caracteres");
  });

  // ============================
  // 6. Contraseña válida
  // ============================
  it("Marca contraseña válida cuando cumple requisitos", () => {
    cy.get("#password").clear().type("1234");
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
  // 8. Botón habilitado
  // ============================
  it("Habilita el botón de login solo si usuario y pass son válidos", () => {
    cy.get("#userId").type("eduardo");
    cy.get("#password").type("1234");
    cy.get("#loginBtn").should("not.be.disabled");
  });

  // ============================
  // 9. Login fallido
  // ============================
  it("Muestra error cuando el backend responde con credenciales inválidas", () => {
    cy.intercept("POST", "http://localhost:3000/api/auth/login", {
      statusCode: 200,
      body: { success: false }
    }).as("loginReq");

    cy.get("#userId").type("eduardo");
    cy.get("#password").type("1234");
    cy.get("#loginBtn").click();

    cy.wait("@loginReq");

    cy.get("#systemAlert").should("contain", "Usuario o contraseña incorrectos");
  });

  // ============================
  // 10. Login correcto
  // ============================
  it("Redirige correctamente según el rol cuando el login es exitoso", () => {
    cy.intercept("POST", "http://localhost:3000/api/auth/login", {
      statusCode: 200,
      body: {
        success: true,
        user: { id_usuario: 1, rol: "admin" }
      }
    }).as("loginReq");

    cy.get("#userId").type("adminuser");
    cy.get("#password").type("1234");
    cy.get("#loginBtn").click();

    cy.wait("@loginReq");
    cy.wait(900);

    cy.url().should("include", "Interfaz.html");
  });

});
