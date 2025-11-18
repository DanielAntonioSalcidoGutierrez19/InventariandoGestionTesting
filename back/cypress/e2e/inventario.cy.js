describe("Inventariando - Interfaz de Inventario", () => {

  beforeEach(() => {
    // 1️⃣ Interceptar productos ANTES del visit
    cy.intercept("GET", "http://localhost:3000/api/productos", {
      statusCode: 200,
      body: [
        {
          id_producto: 1,
          nombre: "Coca Cola",
          tipo: "Bebida",
          descripcion: "Soda fría",
          stock: 10,
          precio: 25,
          imagen: null
        },
        {
          id_producto: 2,
          nombre: "Galletas Oreo",
          tipo: "Galletas",
          descripcion: "Paquete familiar",
          stock: 5,
          precio: 30,
          imagen: null
        }
      ]
    }).as("mockProductos");

    // 2️⃣ Interceptar tipos
    cy.intercept("GET", "http://localhost:3000/api/productos/tipos", {
      statusCode: 200,
      body: ["Bebida", "Galletas", "Snacks"]
    }).as("mockTipos");

    // 3️⃣ Cargar página
    cy.visit("http://localhost/inventariando3/Interfaz.html");

    // 4️⃣ Esperar fetch
    cy.wait("@mockProductos", { timeout: 10000 });
    cy.wait("@mockTipos", { timeout: 10000 });

    // 5️⃣ Verificar ancla de render inicial
    cy.get("#dbItemsAnchor").should("exist");
  });


  // ---------------------------
  // 1️⃣ Carga inicial de productos
  // ---------------------------
  it("Carga y muestra los productos correctamente", () => {
    cy.get("#dbItemsAnchor .item").should("have.length", 2);
    cy.contains("Coca Cola").should("exist");
    cy.contains("Galletas Oreo").should("exist");
  });



  // ---------------------------
  // 3️⃣ Abrir modal de agregar
  // ---------------------------
  it("Abre el modal para AGREGAR producto", () => {
    cy.get(".btn-add").click();
    cy.get("#addModal").should("be.visible");
  });


  // ---------------------------
  // 4️⃣ Validar stock máximo en agregar
  // ---------------------------
  it("Valida límite máximo de STOCK (50) en agregar", () => {
    cy.get(".btn-add").click();

    cy.get("#addQuantity").type("100");
    cy.get("#addForm").submit();

    cy.get("#alertAdd")
      .should("be.visible")
      .and("contain", "El STOCK máximo permitido es 50");
  });


  // ---------------------------
  // 5️⃣ Modal de edición funciona
  // ---------------------------
  it("Abre modal de edición desde un producto renderizado", () => {
    cy.contains("EDITAR").first().click();
    cy.get("#editModal").should("be.visible");
  });


  // ---------------------------
  // 6️⃣ Modal de eliminación
  // ---------------------------
  it("Abre modal de eliminación correctamente", () => {
    cy.get(".btn-delete").first().click();
    cy.get("#deleteModal").should("be.visible");
  });


  // ---------------------------
  // 7️⃣ Confirmación de eliminación
  // ---------------------------
  it("Muestra overlay de confirmación al eliminar", () => {
    cy.get(".btn-delete").first().click();

    cy.get("#deleteId").clear().type("1");
    cy.get("#deleteForm").submit();

    cy.get("#confirmDeleteOverlay")
      .should("be.visible")
      .and("contain", "Confirmar eliminación");
  });

});
