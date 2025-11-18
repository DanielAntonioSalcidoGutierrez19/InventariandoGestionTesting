/// <reference types="cypress" />

describe("Módulo Usuarios - Inventariando", () => {
  const PAGE_URL = "http://localhost/inventariando3/Usuarios.html";
  const API_URL = "http://localhost:3000/api/usuarios";

  beforeEach(() => {
    // 📌 Mock inicial de usuarios
    cy.intercept("GET", API_URL, {
      statusCode: 200,
      body: [
        {
          id_usuario: 1,
          nombre_completo: "Admin Principal",
          correo: "admin@tienda.com",
          rol: "ADMIN",
        },
        {
          id_usuario: 2,
          nombre_completo: "Cajero Uno",
          correo: "cajero1@tienda.com",
          rol: "Cajero",
        },
      ],
    }).as("getUsuarios");

    // Cargar la página
    cy.visit(PAGE_URL);

    // Esperar a que usuarios.js haga el fetch
    cy.wait("@getUsuarios");

    // Asegurar que el grid existe
    cy.get("#usersGrid").should("exist");
  });

  // 1️⃣ Carga de usuarios
  it("Carga y muestra usuarios desde la API", () => {
    cy.get("#usersGrid .user-card").should("have.length", 2);
    cy.contains(".user-card", "Admin Principal").should("exist");
    cy.contains(".user-card", "Cajero Uno").should("exist");
  });

  // 2️⃣ Agregar usuario
  it("Abre el modal para agregar usuario y lo registra correctamente", () => {
    // Mock POST
    cy.intercept("POST", API_URL, {
      statusCode: 201,
      body: {},
    }).as("postUsuario");

    // Mock GET de recarga con el nuevo usuario
    cy.intercept("GET", API_URL, {
      statusCode: 200,
      body: [
        {
          id_usuario: 1,
          nombre_completo: "Admin Principal",
          correo: "admin@tienda.com",
          rol: "ADMIN",
        },
        {
          id_usuario: 2,
          nombre_completo: "Cajero Uno",
          correo: "cajero1@tienda.com",
          rol: "Cajero",
        },
        {
          id_usuario: 3,
          nombre_completo: "Supervisor Nuevo",
          correo: "sup@tienda.com",
          rol: "Supervisor",
        },
      ],
    }).as("getUsuariosRecargado");

    // Abrir modal agregar
    cy.get(".add-user-btn").click();
    cy.get("#addUserModal").should("be.visible");

    // Llenar formulario
    cy.get("#userName").type("Supervisor Nuevo");
    cy.get("#userRole").select("Supervisor");
    cy.get("#userEmail").type("sup@tienda.com");
    cy.get("#userPassword").type("sup123");

    // Enviar
    cy.get("#addUserForm").submit();

    cy.wait("@postUsuario");
    cy.wait("@getUsuariosRecargado");

    // Toast de éxito
    cy.contains(".system-warning", "Usuario agregado correctamente").should(
      "be.visible"
    );

    // Nuevo usuario en el grid
    cy.contains(".user-card", "Supervisor Nuevo").should("exist");
  });

  // 3️⃣ Contraseña admin incorrecta
  it("Muestra error si la contraseña de administrador es incorrecta", () => {
    // Click en una tarjeta de usuario
    cy.get("#usersGrid .user-card").first().click();

    // Aparece modal de contraseña
    cy.get("#passwordConfirmModal").should("be.visible");

    // Poner contraseña incorrecta
    cy.get("#adminPassword").type("clave_incorrecta");
    cy.get("#passwordConfirmForm").submit();

    // Debe mostrar el error
    cy.get("#passwordError").should("be.visible");
  });

  // 4️⃣ Editar usuario con contraseña correcta
  it("Permite editar un usuario tras una contraseña de administrador correcta", () => {
    // Mock PUT
    cy.intercept("PUT", `${API_URL}/1`, {
      statusCode: 200,
      body: {},
    }).as("putUsuario");

    // Mock GET recarga con datos actualizados
    cy.intercept("GET", API_URL, {
      statusCode: 200,
      body: [
        {
          id_usuario: 1,
          nombre_completo: "Admin Actualizado",
          correo: "admin2@tienda.com",
          rol: "ADMIN",
        },
        {
          id_usuario: 2,
          nombre_completo: "Cajero Uno",
          correo: "cajero1@tienda.com",
          rol: "Cajero",
        },
      ],
    }).as("getUsuariosEditados");

    // Click en tarjeta
    cy.get("#usersGrid .user-card").first().click();

    // Contraseña admin correcta
    cy.get("#passwordConfirmModal").should("be.visible");
    cy.get("#adminPassword").type("admin123");
    cy.get("#passwordConfirmForm").submit();

    // Ahora se abre el modal de edición
    cy.get("#editUserModal").should("be.visible");

    // Editar campos
    cy.get("#editUserName").clear().type("Admin Actualizado");
    cy.get("#editUserEmail").clear().type("admin2@tienda.com");
    cy.get("#editUserRole").select("ADMIN");

    // Enviar
    cy.get("#editUserForm").submit();

    cy.wait("@putUsuario");
    cy.wait("@getUsuariosEditados");

    // Toast de éxito
    cy.contains(".system-warning", "Usuario actualizado correctamente").should(
      "be.visible"
    );

    // Nombre actualizado en el grid
    cy.contains(".user-card", "Admin Actualizado").should("exist");
  });

  // 5️⃣ Eliminar usuario con doble confirmación
  it("Elimina un usuario después de la doble confirmación", () => {
    // Mock DELETE
    cy.intercept("DELETE", `${API_URL}/1`, {
      statusCode: 200,
      body: {},
    }).as("deleteUsuario");

    // Mock GET recarga después de eliminar
    cy.intercept("GET", API_URL, {
      statusCode: 200,
      body: [
        {
          id_usuario: 2,
          nombre_completo: "Cajero Uno",
          correo: "cajero1@tienda.com",
          rol: "Cajero",
        },
      ],
    }).as("getUsuariosDespuesDelete");

    // Click en tarjeta
    cy.get("#usersGrid .user-card").first().click();

    // Contraseña admin correcta
    cy.get("#passwordConfirmModal").should("be.visible");
    cy.get("#adminPassword").type("admin123");
    cy.get("#passwordConfirmForm").submit();

    // Modal de edición visible
    cy.get("#editUserModal").should("be.visible");

    // Abrir modal de confirmación de eliminación
    cy.get("#openDeleteUserConfirmBtn").click();
    cy.get("#deleteUserConfirmModal").should("be.visible");

    // Confirmar eliminar
    cy.get("#deleteUserBtn").click();

    cy.wait("@deleteUsuario");
    cy.wait("@getUsuariosDespuesDelete");

    // Toast de éxito
    cy.contains(".system-warning", "Usuario eliminado correctamente").should(
      "be.visible"
    );

    // Solo queda 1 usuario
    cy.get("#usersGrid .user-card").should("have.length", 1);
    cy.contains(".user-card", "Cajero Uno").should("exist");
  });
});
