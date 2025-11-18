// cypress/e2e/reportes.cy.js

describe("Módulo de Reportes - Inventariando", () => {

  beforeEach(() => {

    // Creamos el DOM manual como hacía Jest
    cy.document().then((doc) => {
      doc.body.innerHTML = `
        <div id="seccion-reportes">
          <div class="dato"><div class="dato-valor"></div></div>
          <div class="dato"><div class="dato-valor"></div></div>
        </div>

        <div class="lista-articulos"></div>
        <div class="total-ranking"></div>
      `;
    });

    // Cargamos Reportes.js REAL (NO HTML)
    cy.window().then((win) => {
      return new Cypress.Promise((resolve) => {
        const script = win.document.createElement("script");

        // 👇 ESTA ES LA RUTA CORRECTA DE TU PROYECTO
        script.src = "http://localhost/inventariando3/front/Reportes.js";

        script.onload = () => {
          resolve();
        };

        win.document.head.appendChild(script);
      });
    });
  });

  // Atajo para verificar que JS ya cargó
  const ready = () => cy.window().its("isoToDMY");

  // ================================
  // 1️⃣ PRUEBA isoToDMY
  // ================================
  it("isoToDMY convierte fecha ISO a formato D/M/Y", () => {
    ready().then((isoToDMY) => {
      expect(isoToDMY("2024-12-25")).to.equal("25/12/2024");
    });
  });

  // ================================
  // 2️⃣ cargarReporteDiario
  // ================================
  it("cargarReporteDiario carga tickets y total del día", () => {
    ready().then(() => {
      cy.intercept("GET", "**/api/venta/reporte-dia/*", {
        tickets: 5,
        total: 150.5
      }).as("mockDia");

      cy.window().then((win) => win.cargarReporteDiario("2024-12-25"));

      cy.get("#seccion-reportes .dato-valor").eq(0).should("have.text", "5 uds");
      cy.get("#seccion-reportes .dato-valor").eq(1).should("have.text", "$150.50 mx");
    });
  });

  // ================================
  // 3️⃣ cargarRankingDia
  // ================================
  it("cargarRankingDia construye la lista de ranking", () => {
    ready().then(() => {
      cy.intercept("GET", "**/api/venta/ranking-dia/*", [
        { nombre: "Coca", total_vendido: 3, total_monto: 45 },
        { nombre: "Pepsi", total_vendido: 2, total_monto: 30 }
      ]).as("mockRanking");

      cy.window().then((win) => win.cargarRankingDia("2024-12-25"));

      cy.get(".articulo").should("have.length", 2);
      cy.get(".total-ranking").should("have.text", "TOTAL: $75.00 mx");
    });
  });

  // ================================
  // 4️⃣ ensureTicketContainer
  // ================================
  it("ensureTicketContainer crea el contenedor si no existe", () => {
    ready().then(() => {
      cy.window().then((win) => {
        const lista = win.ensureTicketContainer("seccion-reportes");
        expect(lista).not.to.equal(null);
        expect(lista.className).to.equal("tickets-lista");
      });
    });
  });

  // ================================
  // 5️⃣ cargarTicketsDia
  // ================================
  it("cargarTicketsDia renderiza tickets del día", () => {

    // Sección limpia
    cy.document().then((doc) => {
      doc.body.innerHTML = `<div id="seccion-reportes"></div>`;
    });

    ready().then(() => {
      cy.intercept("GET", "**/api/venta/tickets-dia/*", [
        { folio: 101, total: 20, fecha_venta: "2024-12-25T10:15:30" }
      ]).as("mockTickets");

      cy.window().then((win) => win.cargarTicketsDia("2024-12-25"));

      cy.get(".ticketrow").should("have.length", 1);
    });
  });

});
