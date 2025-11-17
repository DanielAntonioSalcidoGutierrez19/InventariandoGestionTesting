// ==================================================
//  CONFIGURACIÓN GENERAL
// ==================================================
const API_VENTAS = "http://localhost:3000/api/venta";

// ================================================
// Helper — Convertir ISO a dd/mm/yyyy sin timezone
// ================================================
function isoToDMY(iso) {
  if (!iso || typeof iso !== "string") return "--/--/----";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// ==================================================
// Cargar REPORTE DIARIO
// ==================================================
async function cargarReporteDiario(fechaISO) {
  try {
    const r = await fetch(`${API_VENTAS}/reporte-dia/${fechaISO}`);
    const data = await r.json();

    document.querySelector("#seccion-reportes .dato:nth-child(1) .dato-valor")
      .textContent = `${data.tickets || 0} uds`;

    document.querySelector("#seccion-reportes .dato:nth-child(2) .dato-valor")
      .textContent = `$${Number(data.total || 0).toFixed(2)} mx`;

  } catch (err) {
    console.error("Error cargarReporteDiario:", err);
  }
}

// ==================================================
// Asegurar contenedor de Tickets del día
// ==================================================
function ensureTicketContainer(seccionID) {
  if (seccionID !== "seccion-reportes") return null;

  const seccion = document.getElementById(seccionID);
  if (!seccion.querySelector(".tickets-block")) {
    const d = document.createElement("div");
    d.className = "tickets-block";
    d.innerHTML = `
      <div class="titulo-seccion" style="margin-top:15px">Tickets del día</div>
      <div class="tickets-lista"></div>
    `;
    seccion.appendChild(d);
  }

  return seccion.querySelector(".tickets-lista");
}

// ==================================================
// Cargar RANKING DEL DÍA
// ==================================================
async function cargarRankingDia(fechaISO) {
  try {
    const r = await fetch(`${API_VENTAS}/ranking-dia/${fechaISO}`);
    const data = await r.json();

    const lista = document.querySelector(".lista-articulos");
    lista.innerHTML = "";

    let total = 0;

    data.forEach(item => {
      total += Number(item.total_monto);

      const div = document.createElement("div");
      div.className = "articulo";
      div.innerHTML = `
        <div class="nombre-articulo">${item.nombre}</div>
        <div class="cantidad-articulo">${item.total_vendido} uds</div>
        <div class="precio-articulo">$${Number(item.total_monto).toFixed(2)}mx</div>
      `;
      lista.appendChild(div);
    });

    document.querySelector(".total-ranking").textContent = `TOTAL: $${total.toFixed(2)} mx`;

  } catch (err) {
    console.error("Error cargarRankingDia:", err);
  }
}

// ==================================================
// Cargar TICKETS DEL DÍA
// ==================================================
async function cargarTicketsDia(fechaISO) {
  try {
    const r = await fetch(`${API_VENTAS}/tickets-dia/${fechaISO}`);
    const data = await r.json();

    const listaRep = ensureTicketContainer("seccion-reportes");
    if (!listaRep) return;

    listaRep.innerHTML = "";

    data.forEach(t => {
      const fecha = new Date(t.fecha_venta);
      const hh = String(fecha.getHours()).padStart(2, "0");
      const mm = String(fecha.getMinutes()).padStart(2, "0");
      const ss = String(fecha.getSeconds()).padStart(2, "0");

      const row = document.createElement("div");
      row.className = "ticketrow";
      row.style.display = "grid";
      row.style.gridTemplateColumns = "200px 120px 120px";
      row.style.columnGap = "15px";
      row.style.alignItems = "center";
      row.style.padding = "6px 0";
      row.style.borderBottom = "1px solid #ddd";

      row.innerHTML = `
        <div style="font-weight:bold">${t.folio}</div>
        <div style="text-align:center">${hh}:${mm}:${ss}</div>
        <div style="text-align:right">$${Number(t.total).toFixed(2)} mx</div>
      `;
      listaRep.appendChild(row);
    });

  } catch (err) {
    console.error("Error cargarTicketsDia:", err);
  }
}

// ==================================================
// MOSTRAR / OCULTAR MODAL DE FECHA
// ==================================================
function openFechaModal(origen) {
  document.getElementById("modal-fecha").style.display = "flex";
  window._origenFecha = origen;
}

function closeFechaModal() {
  document.getElementById("modal-fecha").style.display = "none";
}

// ==================================================
// Confirmar fecha
// ==================================================
async function confirmarNuevaFecha() {
  const fechaISO = document.getElementById("nueva-fecha").value;
  const texto = isoToDMY(fechaISO);

  if (window._origenFecha === "reportes") {
    document.getElementById("fecha-reportes").textContent = texto;
    await cargarReporteDiario(fechaISO);
  } else {
    document.getElementById("fecha-ranking").textContent = texto;
    await cargarRankingDia(fechaISO);
  }

  await cargarTicketsDia(fechaISO);

  closeFechaModal();
}

// ==================================================
// Inicialización principal de la página
// ==================================================
function initReportesPage() {
  const btnReportes = document.getElementById("btn-reportes");
  const btnRanking = document.getElementById("btn-ranking");
  const seccionReportes = document.getElementById("seccion-reportes");
  const seccionRanking = document.getElementById("seccion-ranking");

  let seccionActual = "reportes";

  // Cambiar secciones
  btnReportes.addEventListener("click", () => {
    seccionReportes.classList.add("activa");
    seccionRanking.classList.remove("activa");
    seccionActual = "reportes";
  });

  btnRanking.addEventListener("click", () => {
    seccionRanking.classList.add("activa");
    seccionReportes.classList.remove("activa");
    seccionActual = "ranking";
  });

  // Botones imprimir
  document.querySelectorAll(".btn-imprimir").forEach(btn => {
    btn.addEventListener("click", () => window.print());
  });

  // Botones modificar fecha
  document.querySelector(".btn-fecha-reportes").addEventListener("click", () => openFechaModal("reportes"));
  document.querySelector(".btn-fecha-ranking").addEventListener("click", () => openFechaModal("ranking"));

  document.getElementById("btn-cancelar").addEventListener("click", closeFechaModal);
  document.getElementById("btn-confirmar").addEventListener("click", confirmarNuevaFecha);

  // Cerrar modal clic fuera
  window.addEventListener("click", (e) => {
    if (e.target === document.getElementById("modal-fecha")) closeFechaModal();
  });

  // Cargar datos iniciales
  const hoy = new Date();
  const y = hoy.getFullYear();
  const m = String(hoy.getMonth() + 1).padStart(2, "0");
  const d = String(hoy.getDate()).padStart(2, "0");

  const fechaISO = `${y}-${m}-${d}`;
  const texto = isoToDMY(fechaISO);

  document.getElementById("fecha-reportes").textContent = texto;
  document.getElementById("fecha-ranking").textContent = texto;

  cargarReporteDiario(fechaISO);
  cargarRankingDia(fechaISO);
  cargarTicketsDia(fechaISO);
}

// ==================================================
// Inicializar solo en navegador
// ==================================================
if (typeof document !== "undefined" && typeof module === "undefined") {
  document.addEventListener("DOMContentLoaded", initReportesPage);
}

// ==================================================
// EXPORTS Para Jest
// ==================================================
if (typeof module !== "undefined" && module.exports) {
 module.exports = {
  isoToDMY,
  cargarReporteDiario,
  cargarRankingDia,
  cargarTicketsDia,
  ensureTicketContainer,
  initReportesPage
};
}
