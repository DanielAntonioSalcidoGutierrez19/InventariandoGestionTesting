/**
 * @jest-environment jsdom
 */

// 1️⃣ Crear el DOM mínimo necesario ANTES del require
document.body.innerHTML = `
  <!-- Barra de búsqueda -->
  <input id="searchInput" />

  <!-- Contenedor de productos -->
  <div id="dbItemsAnchor"></div>

  <!-- Alertas -->
  <div id="alertAdd" class="system-alert"></div>
  <div id="alertEdit" class="system-alert"></div>
  <div id="alertDelete" class="system-alert"></div>

  <!-- Formularios que inventario.js usa para add/edit/delete -->
  <form id="addForm"></form>
  <form id="editForm" data-id=""></form>
  <form id="deleteForm"></form>

  <!-- Selects de tipos -->
  <select id="addTipo"></select>
  <select id="editTipo"></select>

  <!-- Overlay de doble confirmación -->
  <div id="confirmDeleteOverlay" style="display:none">
    <h3 id="confirmTitle"></h3>
    <p id="confirmMessage"></p>
    <button id="confirmPrimary"></button>
    <button id="confirmSecondary"></button>
  </div>
`;

// 2️⃣ Mock global de fetch (antes del require también)
global.fetch = jest.fn();

// 3️⃣ AHORA sí importamos inventario.js
const {
  showAlert,
  createItemElement,
  loadProductos,
  loadTiposEnum,
  loadTiposEnumEdit,
  doubleConfirmDelete,
  API_URL,
} = require("../front/inventario.js");

// 4️⃣ beforeEach: solo limpiamos el contenido variable, NO el body completo
beforeEach(() => {
  document.getElementById("dbItemsAnchor").innerHTML = "";
  document.getElementById("alertAdd").style.display = "none";
  document.getElementById("alertEdit").style.display = "none";
  document.getElementById("alertDelete").style.display = "none";
  global.fetch.mockReset();
});


// =====================================================
// 1. showAlert muestra el mensaje correctamente
// =====================================================
test("showAlert muestra mensaje y tipo correctamente", () => {
  showAlert("alertAdd", "Error al agregar", "error");

  const box = document.getElementById("alertAdd");
  expect(box.textContent).toBe("Error al agregar");
  expect(box.className).toBe("system-alert error");
  expect(box.style.display).toBe("block");
});


// =====================================================
// 2. createItemElement crea estructura correcta
// =====================================================
test("createItemElement renderiza un producto con sus datos", () => {
  const p = {
    id_producto: 15,
    nombre: "Coca-Cola",
    stock: 10,
    precio: 20,
    tipo: "Bebida",
    descripcion: "Refresco",
    imagen: "/uploads/coca.jpg",
  };

  const item = createItemElement(p);

  expect(item.className).toBe("item");
  expect(item.dataset.id).toBe("15");
  expect(item.innerHTML).toContain("Coca-Cola");
  expect(item.innerHTML).toContain("CANTIDAD: 10");
  expect(item.innerHTML).toContain("PRECIO: $20.00");
});


// =====================================================
// 3. loadProductos renderiza elementos en el DOM
// =====================================================
test("loadProductos llena el listado con productos", async () => {
  fetch.mockResolvedValueOnce({
    json: async () => [
      { id_producto: 1, nombre: "Pan Dulce", stock: 5, precio: 12 },
    ],
  });

  await loadProductos();

  const anchor = document.getElementById("dbItemsAnchor");
  expect(anchor.children.length).toBe(1);
  expect(anchor.textContent).toContain("Pan Dulce");
});


// =====================================================
// 4. loadProductos muestra mensaje si no hay productos
// =====================================================
test("loadProductos muestra mensaje cuando no hay productos", async () => {
  fetch.mockResolvedValueOnce({
    json: async () => [],
  });

  await loadProductos();

  expect(document.getElementById("dbItemsAnchor").textContent).toContain(
    "No hay productos registrados."
  );
});


// =====================================================
// 5. loadTiposEnum llena el <select> de agregar
// =====================================================
test("loadTiposEnum llena el select de tipos", async () => {
  fetch.mockResolvedValueOnce({
    json: async () => ["Bebida", "Comida"],
  });

  await loadTiposEnum();

  const sel = document.getElementById("addTipo");
  expect(sel.children.length).toBe(2);
  expect(sel.children[0].textContent).toBe("Bebida");
  expect(sel.children[1].textContent).toBe("Comida");
});


// =====================================================
// 6. loadTiposEnumEdit selecciona tipo correcto en editar
// =====================================================
test("loadTiposEnumEdit selecciona el tipo correcto", async () => {
  fetch.mockResolvedValueOnce({
    json: async () => ["Bebida", "Snack", "Limpieza"],
  });

  await loadTiposEnumEdit("Snack");

  const sel = document.getElementById("editTipo");
  expect(sel.value).toBe("Snack");
});


// =====================================================
// 7. Doble confirmación: primera fase
// =====================================================
test("doubleConfirmDelete inicia overlay y muestra paso 1", () => {
  const fn = jest.fn();
  doubleConfirmDelete(fn);

  expect(document.getElementById("confirmDeleteOverlay").style.display).toBe(
    "flex"
  );
  expect(document.getElementById("confirmTitle").textContent).toContain(
    "Confirmar eliminación"
  );
});


// =====================================================
// 8. Doble confirmación: paso 2 se activa al presionar
// =====================================================
test("doubleConfirmDelete avanza a paso 2 al hacer clic en confirmar", () => {
  const fn = jest.fn();
  doubleConfirmDelete(fn);

  const primary = document.getElementById("confirmPrimary");
  // simulamos click del paso 1
  primary.onclick();

  expect(document.getElementById("confirmTitle").textContent).toContain(
    "Confirmación final"
  );
});


// =====================================================
// 9. createItemElement incluye imagen si existe
// =====================================================
test("createItemElement añade imagen si el producto la tiene", () => {
  const p = {
    id_producto: 3,
    nombre: "Galletas",
    stock: 8,
    precio: 15,
    imagen: "/uploads/g.jpg",
  };

  const item = createItemElement(p);

  const img = item.querySelector("img");
  expect(img).not.toBeNull();
  expect(img.src).toContain("/uploads/g.jpg");
});


// =====================================================
// 10. createItemElement NO crea imagen si no existe
// =====================================================
test("createItemElement no crea imagen si no existe imagen", () => {
  const p = {
    id_producto: 4,
    nombre: "Sin Imagen",
    stock: 2,
    precio: 9,
  };

  const item = createItemElement(p);

  expect(item.querySelector("img")).toBeNull();
});
