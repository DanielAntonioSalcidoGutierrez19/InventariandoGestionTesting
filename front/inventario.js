const API_URL = "http://localhost:3000/api/productos";

/* Helpers de alerta interna por modal */
function showAlert(targetId, message, type = "error", autoHideMs = 3500) {
  const box = document.getElementById(targetId);
  if (!box) return;
  box.textContent = message;
  box.className = `system-alert ${type}`;
  box.style.display = "block";
  if (autoHideMs) setTimeout(() => { box.style.display = "none"; }, autoHideMs);
}

/* Referencias inputs */
const addName = document.getElementById('addName');
const addTipo = document.getElementById('addTipo');
const addDescripcion = document.getElementById('addDescripcion');
const addQuantity = document.getElementById('addQuantity');
const addPrice = document.getElementById('addPrice');

const editName = document.getElementById('editName');
const editTipo = document.getElementById('editTipo');
const editDescripcion = document.getElementById('editDescripcion');
const editQuantity = document.getElementById('editQuantity');
const editPrice = document.getElementById('editPrice');

const deleteId = document.getElementById('deleteId');

/* Overlay confirm delete */
const overlay = document.getElementById('confirmDeleteOverlay');
const confirmTitle = document.getElementById('confirmTitle');
const confirmMessage = document.getElementById('confirmMessage');
const confirmPrimary = document.getElementById('confirmPrimary');
const confirmSecondary = document.getElementById('confirmSecondary');

function openOverlay() { overlay.style.display = 'flex'; }
function closeOverlay() { overlay.style.display = 'none'; }

function setConfirmStep(step, proceed) {
  if (step === 1) {
    confirmTitle.textContent = 'Confirmar eliminación';
    confirmMessage.textContent = '¿Estás seguro que deseas eliminar este artículo?';
    confirmPrimary.textContent = 'Sí, continuar';
    confirmSecondary.textContent = 'Cancelar';
    confirmPrimary.onclick = () => setConfirmStep(2, proceed);
    confirmSecondary.onclick = () => closeOverlay();
  } else {
    confirmTitle.textContent = 'Confirmación final';
    confirmMessage.textContent = 'ESTA ACCIÓN ES PERMANENTE y NO se podrá deshacer. ¿Realmente deseas eliminarlo?';
    confirmPrimary.textContent = 'Sí, eliminar definitivamente';
    confirmSecondary.textContent = 'Atrás';
    confirmPrimary.onclick = async () => { closeOverlay(); await proceed(); };
    confirmSecondary.onclick = () => setConfirmStep(1, proceed);
  }
}
function doubleConfirmDelete(proceed) { setConfirmStep(1, proceed); openOverlay(); }

/* Render de items (sin mostrar STOCK MÍNIMO) */
function createItemElement(p) {
  const div = document.createElement("div");
  div.className = "item";
  div.dataset.id = p.id_producto;
  div.dataset.tipo = p.tipo ?? "";
  div.dataset.descripcion = p.descripcion ?? "";

  const info = document.createElement("div");
  info.className = "item-info";
  const precioTxt = Number(p.precio ?? 0).toFixed(2);
  info.innerHTML = `<strong>${p.nombre}</strong> — ID: ${p.id_producto} — CANTIDAD: ${p.stock} — PRECIO: $${precioTxt}`;

  const img = document.createElement("img");
  img.src = p.imagen ? ("http://localhost:3000" + p.imagen) : "";
  img.alt = p.nombre || "producto";
  img.style.width = "50px";
  img.style.height = "50px";
  img.style.objectFit = "contain";
  img.style.marginLeft = "15px";

  const btn = document.createElement("button");
  btn.className = "btn btn-edit";
  btn.textContent = "EDITAR";
  btn.onclick = () => openEditModal(btn);

  div.appendChild(info);
  if (p.imagen) div.appendChild(img);
  div.appendChild(btn);

  return div;
}

async function loadProductos() {
  try {
    const res = await fetch(API_URL);
    const productos = await res.json();

    const anchor = document.getElementById("dbItemsAnchor");
    anchor.innerHTML = "";

    if (!Array.isArray(productos) || !productos.length) {
      anchor.innerHTML = `<p style="text-align:center; padding:1rem;">No hay productos registrados.</p>`;
      return;
    }

    productos.forEach(p => anchor.appendChild(createItemElement(p)));
  } catch (err) {
    console.error("Error al cargar productos:", err);
  }
}

/* Búsqueda */
document.getElementById("searchInput").addEventListener("input", async (e) => {
  const term = e.target.value.trim();
  try {
    const url = term ? `${API_URL}?search=${encodeURIComponent(term)}` : API_URL;
    const res = await fetch(url);
    const productos = await res.json();

    const anchor = document.getElementById("dbItemsAnchor");
    anchor.innerHTML = "";

    if (!Array.isArray(productos) || !productos.length) {
      anchor.innerHTML = `<p style="padding:1rem; text-align:center;">No se encontraron productos.</p>`;
      return;
    }

    productos.forEach((p) => anchor.appendChild(createItemElement(p)));
  } catch (error) {
    console.error("Error al buscar productos:", error);
  }
});

async function openAddModal(){
  await loadTiposEnum();
  document.getElementById('alertAdd').style.display = 'none';
  document.getElementById('addModal').style.display='flex';
}
function closeAddModal(){ document.getElementById('addModal').style.display='none'; }

async function openEditModal(btn){
  const item = btn.closest('.item');
  const infoText = item.querySelector('.item-info').textContent;
  const nombreMatch = infoText.match(/^\s*(.*?)\s*—/);
  const cantidadMatch = infoText.match(/CANTIDAD:\s*(\d+)/);
  const precioMatch = infoText.match(/PRECIO:\s*\$(\d+(?:\.\d+)?)/);

  editName.value = (nombreMatch ? nombreMatch[1] : "").trim();
  editQuantity.value = cantidadMatch ? cantidadMatch[1] : 0;
  editPrice.value = precioMatch ? precioMatch[1] : 0;

  await loadTiposEnumEdit(item.dataset.tipo || "");
  editDescripcion.value = item.dataset.descripcion || "";
  document.getElementById('editForm').dataset.id = item.dataset.id;
  document.getElementById('editImage').value = ""; // limpia selección previa

  document.getElementById('alertEdit').style.display = 'none';
  document.getElementById('editModal').style.display='flex';
}

function closeEditModal(){ document.getElementById('editModal').style.display='none'; }
function openDeleteModal(){
  document.getElementById('alertDelete').style.display = 'none';
  document.getElementById('deleteModal').style.display='flex';
}
function closeDeleteModal(){ document.getElementById('deleteModal').style.display='none'; }

/* ADD: FormData con imagen obligatoria y stock_minimo=5 automático */
document.getElementById('addForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const stockVal = Number(addQuantity.value || 0);
  if (stockVal > 50) {
    showAlert('alertAdd', 'El STOCK máximo permitido es 50. Se ajustó a 50.', 'error');
    addQuantity.value = 50;
    return;
  }

  try {
    const formData = new FormData();
    formData.append("nombre", addName.value);
    formData.append("tipo", addTipo.value);
    formData.append("descripcion", addDescripcion.value);
    formData.append("stock", addQuantity.value);
    formData.append("stock_minimo", 5);               // ← SIEMPRE 5 (oculto)
    formData.append("precio", addPrice.value);
    formData.append("imagen", document.getElementById("addImage").files[0]);

    const res = await fetch(API_URL, { method: 'POST', body: formData });
    const j = await res.json().catch(()=>({}));
    if (!res.ok || j.success === false) throw new Error(j.message || 'No se pudo agregar el producto');

    showAlert('alertAdd', '✅ Producto agregado correctamente', 'success');
    await loadProductos();
    e.target.reset();

    setTimeout(() => { closeAddModal(); }, 1000);
  } catch (err) {
    console.error('addForm:', err);
    showAlert('alertAdd', err.message || 'No se pudo agregar el producto', 'error');
  }
});

/* EDIT: FormData con imagen OPCIONAL y stock_minimo=5 automático */
document.getElementById('editForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = e.target.dataset.id;

  const stockVal = Number(editQuantity.value || 0);
  if (stockVal > 50) {
    showAlert('alertEdit', 'El STOCK máximo permitido es 50. Se ajustó a 50.', 'error');
    editQuantity.value = 50;
    return;
  }

  try {
    const formData = new FormData();
    formData.append("nombre", editName.value);
    formData.append("tipo", editTipo.value);
    formData.append("descripcion", editDescripcion.value);
    formData.append("stock", editQuantity.value);
    formData.append("stock_minimo", 5);               // ← SIEMPRE 5 (oculto)
    formData.append("precio", editPrice.value);
    const newImg = document.getElementById("editImage").files[0];
    if (newImg) formData.append("imagen", newImg);

    const res = await fetch(`${API_URL}/${id}`, { method: 'PUT', body: formData });
    const j = await res.json().catch(()=>({}));
    if (!res.ok || j.success === false) throw new Error(j.message || 'No se pudo actualizar el producto');

    showAlert('alertEdit', '✅ Producto actualizado correctamente', 'success');
    await loadProductos();

    setTimeout(() => { closeEditModal(); }, 1000);
  } catch (err) {
    console.error('editForm:', err);
    showAlert('alertEdit', err.message || 'No se pudo actualizar el producto', 'error');
  }
});

/* DELETE con doble confirmación interna */
document.getElementById('deleteForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = deleteId.value.trim();
  if (!id) { showAlert('alertDelete', 'Ingresa un ID válido', 'error'); return; }

  doubleConfirmDelete(async () => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      const j = await res.json().catch(()=>({}));
      if (!res.ok || j.success === false) throw new Error(j.message || 'No se pudo eliminar el producto');

      showAlert('alertDelete', '🗑️ Producto eliminado correctamente', 'success');
      const card = document.querySelector(`.item[data-id='${id}']`);
      if (card) card.remove();
      deleteId.value = '';

      setTimeout(() => { closeDeleteModal(); }, 1000);
    } catch (err) {
      console.error('deleteForm:', err);
      showAlert('alertDelete', err.message || 'No se pudo eliminar el producto', 'error');
    }
  });
});

async function loadTiposEnum(){
  try{
    const res = await fetch("http://localhost:3000/api/productos/tipos");
    const tipos = await res.json();
    const sel = document.getElementById("addTipo");
    sel.innerHTML = "";
    tipos.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      sel.appendChild(opt);
    });
  }catch(err){
    console.error('loadTiposEnum:', err);
  }
}

async function loadTiposEnumEdit(selectedTipo){
  try{
    const res = await fetch("http://localhost:3000/api/productos/tipos");
    const tipos = await res.json();
    const sel = document.getElementById("editTipo");
    sel.innerHTML = "";
    tipos.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      if(selectedTipo === t) opt.selected = true;
      sel.appendChild(opt);
    });
  }catch(err){
    console.error('loadTiposEnumEdit:', err);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadProductos();
  await loadTiposEnum();
});

/* ==== EXPORT PARA JEST (no afecta al navegador) ==== */
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    showAlert,
    createItemElement,
    loadProductos,
    loadTiposEnum,
    loadTiposEnumEdit,
    doubleConfirmDelete,
    API_URL
  };
}
