// === helpers de sesión (si los usas después puedes pegarlos aquí) ===
function getLoggedUserId() {
  const raw = localStorage.getItem("id_usuario");
  const n = raw !== null ? parseInt(raw, 10) : null;
  return Number.isNaN(n) ? null : n;
}
function ensureLoggedOrWarn() {
  const id = getLoggedUserId();
  if (id === null) {
    showSystemWarning("⚠️ No se detecta usuario en sesión. Inicia sesión de nuevo.");
  }
  return id;
}

const API_PRODUCTOS = "http://localhost:3000/api/productos";
const API_VENTA = "http://localhost:3000/api/venta";

let productos = [];
let productsDB = {};
let cart = [];
let total = 0;
let selectedPaymentMethod = "";
let cashAmount = 0;
let change = 0;

// para doble clic de categoría
let currentCategory = "";

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", async () => {
    ensureLoggedOrWarn();
    await loadProducts();
    hookSearch();
  });
}

async function loadProducts() {
  try {
    const res = await fetch(API_PRODUCTOS);
    const data = await res.json();
    productos = Array.isArray(data) ? data : [];
    productsDB = {};
    productos.forEach((p) => {
      productsDB[String(p.id_producto)] = {
        name: p.nombre,
        price: Number(p.precio),
        stock: Number(p.stock),
        tipo: p.tipo || "",
        descripcion: p.descripcion || "",
        stock_minimo: Number(p.stock_minimo ?? 0),
      };
    });
    renderProducts(productos);
  } catch (err) {
    console.error(err);
    showSystemWarning("❌ Error al conectar con la base de datos");
  }
}

function renderProducts(list) {
  const container = document.getElementById("productsList");
  if (!container) return;
  container.innerHTML = "";
  list.forEach((p) => {
    const div = document.createElement("div");
    div.className = "product-item";
    div.dataset.id = p.id_producto;
    div.dataset.price = p.precio;
    div.dataset.stock = p.stock;
    div.dataset.tipo = p.tipo || "";
    div.innerHTML = `
      <span class="product-name">${p.nombre}</span>
      <span class="product-price">$${Number(p.precio).toFixed(2)}</span>
      ${
        p.stock == 0
          ? '<div class="stock-low">❌ SIN STOCK</div>'
          : (p.stock <= p.stock_minimo
              ? '<div class="stock-low">⚠️ POCO STOCK</div>'
              : ''
            )
      }
    `;
    div.addEventListener("click", () => addToCartElement(div));
    container.appendChild(div);
  });
}

// FILTRAR POR CATEGORIA (con doble clic para limpiar)
function filterByCategory(category) {
  if (currentCategory === category) {
    currentCategory = "";
    renderProducts(productos);
    return;
  }
  currentCategory = category;
  const filtered = productos.filter(p => p.tipo === category);
  renderProducts(filtered);
}

function hookSearch() {
  const input = document.getElementById("searchProducts");
  if (!input) return;
  input.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(searchTerm) ||
        (p.tipo || "").toLowerCase().includes(searchTerm) ||
        (p.descripcion || "").toLowerCase().includes(searchTerm)
    );
    renderProducts(filtered);
  });
}

// ⚠️ AVISO INTERNO (sin alert())
function showSystemWarning(message) {
  if (typeof document === "undefined") return;
  const warning = document.createElement("div");
  warning.className = "stock-warning";
  warning.textContent = message;
  document.body.appendChild(warning);
  setTimeout(() => warning.remove(), 4000);
}

// 🛒 Agregar al carrito
function addToCartElement(productElement) {
  const productId = productElement.dataset.id;
  const productName = productElement.querySelector(".product-name").textContent;
  const productPrice = parseFloat(productElement.dataset.price);
  const currentStock = Number(productsDB[productId]?.stock ?? 0);
  const stockMin = Number(productsDB[productId]?.stock_minimo ?? 0);

  if (currentStock <= 0) {
    showSystemWarning(`❌ Sin stock disponible de ${productName}`);
    return;
  }

  const existingItem = cart.find((item) => item.id === productId);
  let newQuantity = 1;

  if (existingItem) {
    if (existingItem.quantity + 1 > currentStock) {
      showSystemWarning(`⚠️ No hay suficiente stock de ${productName}`);
      return;
    }
    existingItem.quantity++;
    existingItem.subtotal = existingItem.quantity * existingItem.price;
    newQuantity = existingItem.quantity;
  } else {
    cart.push({
      id: productId,
      name: productName,
      price: productPrice,
      quantity: 1,
      subtotal: productPrice,
    });
  }

  const remaining = currentStock - newQuantity;
  if (remaining <= stockMin) showSystemWarning(`⚠️ ${productName} está llegando a su stock mínimo (${remaining} uds).`);

  updateCartDisplay();
}

// 🧮 Actualizar carrito
function updateCartDisplay() {
  const cartItemsContainer = document.getElementById("cartItems");
  const totalAmountElement = document.getElementById("totalAmount");
  const bar = document.getElementById("checkoutBar");
  if (!cartItemsContainer || !totalAmountElement || !bar) return;

  cartItemsContainer.innerHTML = "";
  total = 0;
  cart.forEach((item) => {
    total += item.subtotal;
    const cartItemElement = document.createElement("div");
    cartItemElement.className = "cart-item";
    cartItemElement.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${item.price.toFixed(2)} c/u</div>
      </div>
      <div class="cart-item-quantity">
        <button class="quantity-btn" onclick="decreaseQuantity('${item.id}')">-</button>
        <span class="quantity">${item.quantity}</span>
        <button class="quantity-btn" onclick="increaseQuantity('${item.id}')">+</button>
      </div>
      <div class="cart-item-subtotal">$${item.subtotal.toFixed(2)}</div>
    `;
    cartItemsContainer.appendChild(cartItemElement);
  });
  totalAmountElement.textContent = `$${total.toFixed(2)}`;
  bar.style.display = cart.length > 0 ? "block" : "none";
}

// ➕ Aumentar cantidad
function increaseQuantity(productId) {
  const item = cart.find((i) => i.id === productId);
  const stock = Number(productsDB[productId]?.stock ?? 0);
  const stockMin = Number(productsDB[productId]?.stock_minimo ?? 0);

  if (item.quantity + 1 > stock) {
    showSystemWarning(`⚠️ No hay suficiente stock de ${item.name}. Disponible: ${stock}`);
    return;
  }

  item.quantity++;
  item.subtotal = item.quantity * item.price;
  const remaining = stock - item.quantity;
  if (remaining <= stockMin) showSystemWarning(`⚠️ ${item.name} está en stock mínimo (${remaining} uds).`);
  updateCartDisplay();
}

// ➖ Disminuir cantidad
function decreaseQuantity(productId) {
  const item = cart.find((i) => i.id === productId);
  if (!item) return;
  item.quantity--;
  if (item.quantity <= 0) cart = cart.filter((i) => i.id !== productId);
  else item.subtotal = item.quantity * item.price;
  updateCartDisplay();
}

// 💳 Métodos de pago (toggle / marca visual)
function selectPaymentMethod(method) {
  selectedPaymentMethod = method;
  const cashContainer = document.getElementById("cashInputContainer");
  const changeDisplay = document.getElementById("changeDisplay");

  const btnCash = document.querySelector(".btn-cash");
  const btnTransfer = document.querySelector(".btn-transfer");

  if (!btnCash || !btnTransfer || !cashContainer || !changeDisplay) return;

  // limpiar estado visual
  btnCash.classList.remove("active-payment");
  btnTransfer.classList.remove("active-payment");

  if (method === "efectivo") {
    btnCash.classList.add("active-payment");
    cashContainer.style.display = "block";
    changeDisplay.style.display = "none";
  } else if (method === "transferencia") {
    if (btnTransfer.classList.contains("active-payment")) {
      btnTransfer.classList.remove("active-payment");
      selectedPaymentMethod = "";
    } else {
      btnTransfer.classList.add("active-payment");
    }
    cashContainer.style.display = "none";
    changeDisplay.style.display = "none";
  }
}

// 💵 Cálculo de cambio / faltante en efectivo (en vivo)
function calculateChange() {
  const input = document.getElementById("cashAmount");
  const changeDisplay = document.getElementById("changeDisplay");
  if (!input || !changeDisplay) return;

  cashAmount = parseFloat(input.value) || 0;

  if (total > 0 && cashAmount >= 0) {
    change = cashAmount - total;
    changeDisplay.style.display = "block";

    if (change < 0) {
      changeDisplay.innerHTML = `FALTAN: $<span id="changeAmount">${Math.abs(change).toFixed(2)}</span>`;
    } else {
      changeDisplay.innerHTML = `CAMBIO: $<span id="changeAmount">${change.toFixed(2)}</span>`;
    }
  } else {
    changeDisplay.style.display = "none";
  }
}

// 🧾 Ticket (preview)
function generateTicket() {
  if (cart.length === 0) return showSystemWarning("🛒 No hay productos en el carrito");
  const ticket = document.getElementById("ticketContent");
  const modal = document.getElementById("ticketModal");
  if (!ticket || !modal) return;

  ticket.innerHTML = `<img src="./front/img/inventariando.jpg" alt="inventariando" style="width:110px; margin-bottom:8px; opacity:0.85;">`;
  let html = `<div style="text-align:center"><h3>TIENDA</h3><p>${new Date().toLocaleString()}</p></div>`;
  cart.forEach((i) => {
    html += `<div class="ticket-item"><span>${i.name} x${i.quantity}</span><span>$${i.subtotal.toFixed(2)}</span></div>`;
  });
  html += `<div class="ticket-total"><span>TOTAL:</span><span>$${total.toFixed(2)}</span></div>`;
  ticket.innerHTML += html;
  modal.style.display = "flex";
}

// 🧾 Registrar venta
async function registerAndPrint() {
  if (!selectedPaymentMethod) return showSystemWarning("Selecciona un método de pago");

  // Validar EFECTIVO antes
  if (selectedPaymentMethod === "efectivo") {
    const input = document.getElementById("cashAmount");
    if (!input) return;
    cashAmount = parseFloat(input.value) || 0;
    if (cashAmount <= 0) return showSystemWarning("Ingresa el monto entregado en efectivo");
    if (cashAmount < total) return showSystemWarning(`Faltan $${(total - cashAmount).toFixed(2)} pesos.`);
  }

  try {
    const productosVenta = cart.map(i => ({
      id_producto: parseInt(i.id, 10),
      cantidad: i.quantity,
      precio_unitario: i.price
    }));

    const idUsuario = getLoggedUserId(); // si existe

    const response = await fetch(API_VENTA, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_usuario: idUsuario ?? null,
        metodo_pago: selectedPaymentMethod,
        productos: productosVenta
      })
    });

    if (!response.ok) throw new Error("Error al registrar venta");

    showSystemWarning("✅ Venta registrada correctamente");

    cart = [];
    updateCartDisplay();

    selectedPaymentMethod = "";
    const btnCash = document.querySelector(".btn-cash");
    const btnTransfer = document.querySelector(".btn-transfer");
    const input = document.getElementById("cashAmount");
    const changeDisplay = document.getElementById("changeDisplay");
    const cashContainer = document.getElementById("cashInputContainer");

    if (btnCash) btnCash.classList.remove("active-payment");
    if (btnTransfer) btnTransfer.classList.remove("active-payment");

    if (input) input.value = "";
    cashAmount = 0;
    change = 0;
    if (changeDisplay) changeDisplay.style.display = "none";
    if (cashContainer) cashContainer.style.display = "none";

    closeTicketModal();
    await loadProducts();

  } catch (err) {
    console.error(err);
    showSystemWarning("❌ Error al registrar venta");
  }
}

function closeTicketModal() {
  const modal = document.getElementById("ticketModal");
  if (modal) modal.style.display = "none";
}

// ❗ Export para Jest (no afecta al navegador)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    loadProducts,
    renderProducts,
    filterByCategory,
    hookSearch,
    showSystemWarning,
    addToCartElement,
    updateCartDisplay,
    increaseQuantity,
    decreaseQuantity,
    selectPaymentMethod,
    calculateChange,
    generateTicket,
    registerAndPrint,
    closeTicketModal,
    _test: {
      get productos() { return productos; },
      set productos(v) { productos = v; },
      get productsDB() { return productsDB; },
      set productsDB(v) { productsDB = v; },
      get cart() { return cart; },
      set cart(v) { cart = v; },
      get total() { return total; },
      set total(v) { total = v; },
      get selectedPaymentMethod() { return selectedPaymentMethod; },
      set selectedPaymentMethod(v) { selectedPaymentMethod = v; },
      get cashAmount() { return cashAmount; },
      set cashAmount(v) { cashAmount = v; },
      get change() { return change; },
      set change(v) { change = v; }
    }
  };
}
