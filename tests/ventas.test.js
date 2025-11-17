const {
  loadProducts,
  addToCartElement,
  calculateChange,
  generateTicket,
  registerAndPrint,
  _test
} = require("../front/sistemaVentas.js");

beforeEach(() => {
  // DOM mínimo que usan las funciones
  document.body.innerHTML = `
    <div id="productsList"></div>
    <div id="cartItems"></div>
    <div id="checkoutBar" style="display:none;"></div>
    <span id="totalAmount">$0.00</span>

    <div id="ticketContent"></div>
    <div id="ticketModal" style="display:none;"></div>

    <input id="cashAmount" value="0" />
    <div id="changeDisplay" style="display:none;"></div>

    <div id="cashInputContainer" style="display:none;"></div>
    <button class="btn-cash"></button>
    <button class="btn-transfer"></button>
  `;

  // Reiniciar estado global
  _test.productos = [];
  _test.productsDB = {};
  _test.cart = [];
  _test.total = 0;
  _test.selectedPaymentMethod = "";
  _test.cashAmount = 0;
  _test.change = 0;

  global.fetch = undefined;
});

// 1) Productos
test("loadProducts carga productos y llena productsDB", async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve([
        { id_producto: 1, nombre: "Coca", precio: 12, stock: 5, tipo: "BEBIDAS", descripcion: "", stock_minimo: 1 }
      ])
    })
  );

  await loadProducts();

  const productos = _test.productos;
  const db = _test.productsDB;

  expect(productos.length).toBe(1);
  expect(db["1"].name).toBe("Coca");
  expect(db["1"].price).toBe(12);
});

// 2) Carrito
test("addToCartElement agrega producto al carrito y actualiza total", () => {
  _test.productsDB = {
    "1": { name: "Coca", price: 12, stock: 10, tipo: "BEBIDAS", descripcion: "", stock_minimo: 1 }
  };

  const productDiv = document.createElement("div");
  productDiv.className = "product-item";
  productDiv.dataset.id = "1";
  productDiv.dataset.price = "12";
  productDiv.innerHTML = `
    <span class="product-name">Coca</span>
    <span class="product-price">$12.00</span>
  `;

  addToCartElement(productDiv);

  const cart = _test.cart;
  expect(cart.length).toBe(1);
  expect(cart[0].name).toBe("Coca");
  expect(cart[0].subtotal).toBe(12);

  const totalText = document.getElementById("totalAmount").textContent;
  expect(totalText).toBe("$12.00");
  expect(document.getElementById("checkoutBar").style.display).toBe("block");
});

// 3) Método de pago / cambio
test("calculateChange calcula correctamente el cambio", () => {
  _test.total = 50;
  document.getElementById("cashAmount").value = "100";

  calculateChange();

  expect(_test.change).toBe(50);
  expect(document.getElementById("changeDisplay").innerHTML).toContain("CAMBIO");
  expect(document.getElementById("changeDisplay").innerHTML).toContain("50.00");
});

// 4) Ticket
test("generateTicket genera ticket con productos y muestra el modal", () => {
  _test.cart = [
    { id: "1", name: "Coca", price: 12, quantity: 2, subtotal: 24 }
  ];
  _test.total = 24;

  generateTicket();

  const html = document.getElementById("ticketContent").innerHTML;
  expect(html).toContain("Coca");
  expect(html).toContain("24.00");
  expect(document.getElementById("ticketModal").style.display).toBe("flex");
});

// 5) Registro de venta
test("registerAndPrint registra venta y limpia carrito", async () => {
  _test.cart = [
    { id: "1", name: "Coca", price: 10, quantity: 2, subtotal: 20 }
  ];
  _test.total = 20;
  _test.selectedPaymentMethod = "efectivo";
  document.getElementById("cashAmount").value = "50";

  global.fetch = jest.fn()
    // primera llamada: /api/venta
    .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
    // segunda llamada: /api/productos de loadProducts
    .mockResolvedValueOnce({ ok: true, json: async () => [] });

  await registerAndPrint();

  const cart = _test.cart;
  expect(cart.length).toBe(0);
  expect(document.getElementById("checkoutBar").style.display).toBe("none");
});
