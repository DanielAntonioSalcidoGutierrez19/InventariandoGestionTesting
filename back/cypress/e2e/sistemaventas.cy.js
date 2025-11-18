/// <reference types="cypress" />

describe("Módulo Sistema de Ventas - Inventariando", () => {

  beforeEach(() => {

    cy.intercept("GET", "http://localhost:3000/api/productos", {
      statusCode: 200,
      body: [
        {
          id_producto: 1,
          nombre: "Coca Cola",
          precio: 12,
          stock: 10,
          tipo: "BEBIDAS",
          descripcion: "",
          stock_minimo: 1
        }
      ]
    }).as("mockProductos");

    cy.intercept("POST", "http://localhost:3000/api/venta", {
      statusCode: 200,
      body: { ok: true }
    }).as("mockVenta");

    cy.visit("http://localhost/inventariando3/SistemaVentasAdmin.html");

    cy.wait("@mockProductos");
    cy.get("#productsList").should("exist");
  });

  it("loadProducts carga productos y llena la lista", () => {
    cy.get("#productsList .product-item")
      .should("have.length", 1);

    cy.contains("Coca Cola").should("exist");
  });

  it("addToCartElement agrega un producto al carrito", () => {
    cy.get("#productsList .product-item").first().click();
    cy.get("#cartItems .cart-item").should("have.length", 1);
    cy.get("#totalAmount").should("contain", "12.00");
  });

  it("calculateChange calcula correctamente el cambio", () => {
    cy.get("#productsList .product-item").first().click();
    cy.get(".btn-ticket-right").click();
    cy.get(".btn-cash").click();
    cy.get("#cashAmount").type("100");
    cy.get("#changeDisplay")
      .should("be.visible")
      .should("contain", "CAMBIO");
  });

  it("generateTicket genera ticket con información", () => {
    cy.get("#productsList .product-item").first().click();
    cy.get(".btn-ticket-right").click();
    cy.get("#ticketModal").should("be.visible");
    cy.get("#ticketContent").should("contain.html", "img");
  });

  it("registerAndPrint registra venta y limpia carrito", () => {
    cy.get("#productsList .product-item").first().click();
    cy.get(".btn-ticket-right").click();
    cy.get(".btn-cash").click();
    cy.get("#cashAmount").type("100");
    cy.get(".btn-print").click();
    cy.wait("@mockVenta");
    cy.get("#cartItems .cart-item").should("have.length", 0);
    cy.get("#checkoutBar").should("have.css", "display", "none");
  });

});
