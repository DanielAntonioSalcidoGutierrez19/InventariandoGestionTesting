/**
 * TEST UNITARIOS PARA MODULO DE REPORTES
 */
const {
  isoToDMY,
  ensureTicketContainer,
  cargarReporteDiario,
  cargarRankingDia,
  cargarTicketsDia
} = require("../front/Reportes.js");

beforeEach(() => {
  document.body.innerHTML = `
    <div id="seccion-reportes">
      <div class="dato"><div class="dato-valor"></div></div>
      <div class="dato"><div class="dato-valor"></div></div>
    </div>

    <div class="lista-articulos"></div>
    <div class="total-ranking"></div>
  `;

  global.fetch = undefined;
});

/* 1️⃣ isoToDMY */
test("isoToDMY convierte fecha ISO a formato D/M/Y", () => {
  expect(isoToDMY("2024-12-25")).toBe("25/12/2024");
});

/* 2️⃣ cargarReporteDiario */
test("cargarReporteDiario carga tickets y total del día", async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ tickets: 5, total: 150.5 })
    })
  );

  await cargarReporteDiario("2024-12-25");

  const vals = document.querySelectorAll("#seccion-reportes .dato-valor");
  expect(vals[0].textContent).toBe("5 uds");
 expect(vals[1].textContent).toBe("$150.50 mx");

});

/* 3️⃣ cargarRankingDia */
test("cargarRankingDia construye la lista de ranking", async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve([
          { nombre: "Coca", total_vendido: 3, total_monto: 45 },
          { nombre: "Pepsi", total_vendido: 2, total_monto: 30 }
        ])
    })
  );

  await cargarRankingDia("2024-12-25");

  expect(document.querySelectorAll(".articulo").length).toBe(2);
 expect(document.querySelector(".total-ranking").textContent).toBe("TOTAL: $75.00 mx");

});

/* 4️⃣ ensureTicketContainer */
test("ensureTicketContainer crea contenedor de tickets si no existe", () => {
  const lista = ensureTicketContainer("seccion-reportes");

  expect(lista).not.toBeNull();
  expect(lista.className).toBe("tickets-lista");
});

/* 5️⃣ cargarTicketsDia */
test("cargarTicketsDia renderiza tickets del día", async () => {
  document.body.innerHTML = `
    <div id="seccion-reportes"></div>
  `;

  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve([
          { folio: 101, total: 20, fecha_venta: "2024-12-25T10:15:30" }
        ])
    })
  );

  await cargarTicketsDia("2024-12-25");

  const filas = document.querySelectorAll(".ticketrow");
  expect(filas.length).toBe(1);
});
