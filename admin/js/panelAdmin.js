/** ================================================================
 * PANEL ADMIN – VERSIÓN ESTABLE Y FUNCIONAL (CRUD COMPLETO + BD REAL)
 * ================================================================ */

//
// ===================== 1. CONFIGURACIÓN GLOBAL =====================
//
const AUTH_API_URL = 'http://localhost:8080/api/auth';
const ADMIN_API_URL = 'http://localhost:8080/api/admin';

const API_OPTS = {
  headers: { "Content-Type": "application/json" },
  credentials: "include"
};

let currentProductId = null;
let currentCustomerId = null;

//
// ===================== 2. AUTENTICACIÓN =====================
//
async function me() {
  try {
    const r = await fetch(`${AUTH_API_URL}/me`, { ...API_OPTS, method: "GET" });
    return r.ok ? r.json() : { authenticated: false, roles: [] };
  } catch {
    return { authenticated: false, roles: [] };
  }
}

async function logout() {
  try {
    await fetch(`${AUTH_API_URL}/logout`, { ...API_OPTS, method: "POST" });
  } catch {}
  location.href = "../pages/login.html";
}

//
// ===================== 3. UTILIDADES =====================
//
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `
    px-4 py-3 text-white rounded-lg shadow-md pointer-events-auto 
    animate-fade-in-up border border-white/10 backdrop-blur-md
    ${type === "success" ? "bg-green-500/80" :
      type === "error" ? "bg-red-500/80" :
      "bg-blue-500/80"}
  `;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("animate-fade-out");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function animateSection(section) {
  section.classList.add("animate-section");
  setTimeout(() => section.classList.remove("animate-section"), 500);
}

//
// ===================== 4. DASHBOARD (PEDIDOS REALES) =====================
//
async function loadDashboardData(searchTerm = "") {
  try {
    // ⚠ Aquí podrás conectar tus estadísticas reales
    const stats = { ventas: 42500, pedidos: 211, productos: 160, clientes: 1290 };
    document.getElementById("stat-ventas").textContent = `S/ ${stats.ventas.toLocaleString("es-PE")}`;
    document.getElementById("stat-pedidos").textContent = stats.pedidos;
    document.getElementById("stat-productos").textContent = stats.productos;
    document.getElementById("stat-clientes").textContent = stats.clientes;

    // PEDIDOS
    const body = document.getElementById("orders-body");
    body.innerHTML = `<tr><td colspan="6" class="p-3 text-center text-gray-500">Cargando...</td></tr>`;

    const url = new URL(`${ADMIN_API_URL}/orders`);
    url.searchParams.append("limit", 5);
    if (searchTerm) url.searchParams.append("search", searchTerm);

    const r = await fetch(url, API_OPTS);
    if (!r.ok) throw new Error();
    const orders = await r.json();

    if (!orders.length) {
      body.innerHTML = `<tr><td colspan="6" class="p-3 text-center">No se encontraron pedidos.</td></tr>`;
      return;
    }

    body.innerHTML = orders
      .map(o => `
        <tr class="text-sm hover:bg-gray-50">
          <td class="px-4 py-3 font-medium">#${String(o.id).padStart(4, "0")}</td>
          <td class="px-4 py-3">${o.clientName}</td>
          <td class="px-4 py-3">${o.productName}</td>
          <td class="px-4 py-3 font-medium">S/ ${o.total.toFixed(2)}</td>
          <td class="px-4 py-3">
            <span class="badge-${o.status === "Completado" ? "success" : "warning"}">${o.status}</span>
          </td>
          <td class="px-4 py-3"><button class="text-cyan-600">Ver</button></td>
        </tr>
      `).join("");

  } catch (err) {
    console.error(err);
    showToast("Error cargando pedidos", "error");
  }
}

//
// ===================== 5. CRUD PRODUCTOS =====================
//
async function loadProducts() {
  const body = document.getElementById("products-table-body");
  body.innerHTML = `<tr><td colspan="5" class="p-3 text-center">Cargando...</td></tr>`;

  try {
    const r = await fetch(`${ADMIN_API_URL}/products`, API_OPTS);
    if (!r.ok) throw new Error();
    
    const json = await r.json();
    const products = Array.isArray(json) ? json : json.content;

    if (!Array.isArray(products) || !products.length) {
      body.innerHTML = `<tr><td colspan="5" class="p-3 text-center">Sin productos.</td></tr>`;
      return;
    }

    body.innerHTML = products
      .map(p => `
        <tr class="hover:bg-gray-50 text-sm">
          <td class="px-4 py-3">${p.id}</td>
          <td class="px-4 py-3">${p.name}</td>
          <td class="px-4 py-3">${p.stock ?? 0}</td>
          <td class="px-4 py-3">S/ ${p.price?.toFixed(2)}</td>
          <td class="px-4 py-3 text-right space-x-3">
            <button class="btn-edit text-cyan-600" data-id="${p.id}">Editar</button>
            <button class="btn-delete text-rose-600" data-id="${p.id}">Eliminar</button>
          </td>
        </tr>
      `).join("");

  } catch {
    body.innerHTML = `<tr><td colspan="5" class="text-center p-3 text-red-500">Error al cargar productos.</td></tr>`;
  }
}

async function openProductModal(id = null) {
  currentProductId = id;
  const modal = document.getElementById("product-modal");
  const form = document.getElementById("product-form");
  const title = document.getElementById("product-modal-title");

  form.reset();

  if (!id) {
    title.textContent = "Crear Producto";
    modal.classList.add("show");
    return;
  }

  try {
    title.textContent = "Editar Producto";
    const r = await fetch(`${ADMIN_API_URL}/products/${id}`, API_OPTS);
    const p = await r.json();

    document.getElementById("product-name").value = p.name;
    document.getElementById("product-stock").value = p.stock;
    document.getElementById("product-price").value = p.price;

    modal.classList.add("show");
  } catch {
    showToast("No se pudo cargar el producto", "error");
  }
}

function closeProductModal() {
  document.getElementById("product-modal").classList.remove("show");
  currentProductId = null;
}

async function handleSaveProduct(e) {
  e.preventDefault();

  const data = {
    name: document.getElementById("product-name").value,
    stock: Number(document.getElementById("product-stock").value),
    price: Number(document.getElementById("product-price").value)
  };

  const method = currentProductId ? "PUT" : "POST";
  const url = currentProductId
    ? `${ADMIN_API_URL}/products/${currentProductId}`
    : `${ADMIN_API_URL}/products`;

  try {
    const r = await fetch(url, { ...API_OPTS, method, body: JSON.stringify(data) });
    if (!r.ok) throw new Error();

    closeProductModal();
    showToast(currentProductId ? "Producto actualizado" : "Producto creado");
    loadProducts();
  } catch {
    showToast("Error al guardar", "error");
  }
}

async function handleDeleteProduct(id) {
  if (!confirm("¿Eliminar producto?")) return;

  try {
    const r = await fetch(`${ADMIN_API_URL}/products/${id}`, { ...API_OPTS, method: "DELETE" });
    if (!r.ok) throw new Error();
    showToast("Producto eliminado");
    loadProducts();
  } catch {
    showToast("Error al eliminar", "error");
  }
}

//
// ===================== 6. CRUD CLIENTES =====================
//
async function loadCustomers() {
  const body = document.getElementById("customers-table-body");
  body.innerHTML = `<tr><td colspan="5" class="p-3 text-center">Cargando...</td></tr>`;

  try {
    const r = await fetch(`${ADMIN_API_URL}/customers`, API_OPTS);
    const customers = await r.json();

    if (!customers.length) {
      body.innerHTML = `<tr><td colspan="5" class="text-center">No hay clientes.</td></tr>`;
      return;
    }

    body.innerHTML = customers
      .map(c => `
        <tr class="hover:bg-gray-50 text-sm">
          <td class="px-4 py-3">${c.id}</td>
          <td class="px-4 py-3">${c.firstName} ${c.lastName}</td>
          <td class="px-4 py-3">${c.email}</td>
          <td class="px-4 py-3">${c.phoneNumber ?? "N/A"}</td>
          <td class="px-4 py-3 text-right space-x-3">
            <button class="btn-edit-customer text-cyan-600" data-id="${c.id}">Editar</button>
            <button class="btn-delete-customer text-rose-600" data-id="${c.id}">Eliminar</button>
          </td>
        </tr>
      `).join("");

  } catch {
    body.innerHTML = `<tr><td colspan="5" class="text-center text-red-500">Error.</td></tr>`;
  }
}

async function openCustomerModal(id) {
  currentCustomerId = id;
  const modal = document.getElementById("customer-modal");
  const form = document.getElementById("customer-form");
  const title = document.getElementById("customer-modal-title");

  form.reset();

  try {
    const r = await fetch(`${ADMIN_API_URL}/customers/${id}`, API_OPTS);
    const c = await r.json();

    document.getElementById("customer-firstName").value = c.firstName;
    document.getElementById("customer-lastName").value = c.lastName;
    document.getElementById("customer-email").value = c.email;
    document.getElementById("customer-phone").value = c.phoneNumber;

    title.textContent = "Editar Cliente";
    modal.classList.add("show");
  } catch {
    showToast("Error al cargar cliente", "error");
  }
}

function closeCustomerModal() {
  document.getElementById("customer-modal").classList.remove("show");
  currentCustomerId = null;
}

async function handleSaveCustomer(e) {
  e.preventDefault();

  const data = {
    firstName: document.getElementById("customer-firstName").value,
    lastName: document.getElementById("customer-lastName").value,
    email: document.getElementById("customer-email").value,
    phoneNumber: document.getElementById("customer-phone").value
  };

  try {
    const r = await fetch(`${ADMIN_API_URL}/customers/${currentCustomerId}`, {
      ...API_OPTS,
      method: "PUT",
      body: JSON.stringify(data)
    });

    if (!r.ok) throw new Error();
    closeCustomerModal();
    showToast("Cliente actualizado");
    loadCustomers();

  } catch {
    showToast("Error al guardar", "error");
  }
}

async function handleDeleteCustomer(id) {
  if (!confirm("¿Eliminar cliente?")) return;

  try {
    const r = await fetch(`${ADMIN_API_URL}/customers/${id}`, { ...API_OPTS, method: "DELETE" });
    if (!r.ok) throw new Error();
    showToast("Cliente eliminado");
    loadCustomers();
  } catch {
    showToast("Error al eliminar", "error");
  }
}

//
// ===================== 7. EVENTOS GLOBALES =====================
//
function handleTableClicks(e) {
  const editP = e.target.closest(".btn-edit");
  const delP = e.target.closest(".btn-delete");
  const editC = e.target.closest(".btn-edit-customer");
  const delC = e.target.closest(".btn-delete-customer");

  if (editP) return openProductModal(editP.dataset.id);
  if (delP) return handleDeleteProduct(delP.dataset.id);

  if (editC) return openCustomerModal(editC.dataset.id);
  if (delC) return handleDeleteCustomer(delC.dataset.id);
}

//
// ===================== 8. INIT =====================
//
document.addEventListener("DOMContentLoaded", async () => {
  const loading = document.getElementById("loading-message");
  const adminEmail = document.getElementById("admin-email");
  const sectionTitle = document.getElementById("section-title");

  const sections = {
    dashboard: document.getElementById("dashboard-section"),
    products: document.getElementById("products-section"),
    customers: document.getElementById("customers-section"),
    orders: document.getElementById("orders-section"),
    settings: document.getElementById("settings-section")
  };

  // Validación de acceso
  const user = await me();
  if (!user.authenticated || !user.roles.includes("ROLE_ADMIN")) {
    loading.textContent = "Acceso denegado...";
    return setTimeout(() => (location.href = "../pages/login.html"), 1500);
  }

  loading.classList.add("hidden");
  sections.dashboard.classList.remove("hidden");
  adminEmail.textContent = user.email;

  loadDashboardData();

  // Navegación
  document.getElementById("admin-sidebar").addEventListener("click", e => {
    const link = e.target.closest(".sidebar-link");
    if (!link) return;

    const sec = link.dataset.section;
    sectionTitle.textContent = link.innerText.trim();

    Object.values(sections).forEach(s => s.classList.add("hidden"));
    sections[sec].classList.remove("hidden");
    animateSection(sections[sec]);

    if (sec === "products") loadProducts();
    if (sec === "customers") loadCustomers();
    if (sec === "dashboard") loadDashboardData();
  });

  // Logout
  document.getElementById("logout-button").addEventListener("click", logout);

  // Pedidos: buscador
  document.getElementById("search-orders").addEventListener("keyup", e => {
    if (e.key === "Enter") loadDashboardData(e.target.value);
  });

  // PRODUCTOS
  document.getElementById("btn-crear-producto").addEventListener("click", () => openProductModal());
  document.getElementById("btn-cerrar-modal-producto-x").addEventListener("click", closeProductModal);
  document.getElementById("btn-cerrar-modal-producto-cancelar").addEventListener("click", closeProductModal);
  document.getElementById("product-form").addEventListener("submit", handleSaveProduct);

  // CLIENTES
  document.getElementById("btn-cerrar-modal-cliente-x").addEventListener("click", closeCustomerModal);
  document.getElementById("btn-cerrar-modal-cliente-cancelar").addEventListener("click", closeCustomerModal);
  document.getElementById("customer-form").addEventListener("submit", handleSaveCustomer);

  // DELEGACIÓN TABLAS
  document.getElementById("products-table").addEventListener("click", handleTableClicks);
  document.getElementById("customers-table").addEventListener("click", handleTableClicks);
});

// --- INICIO: Código para Sidebar Responsivo ---
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('admin-sidebar');
  const toggleButton = document.getElementById('mobile-menu-toggle');
  const overlay = document.getElementById('sidebar-overlay');

  // Asegurarnos de que los elementos existen antes de añadir listeners
  if (sidebar && toggleButton && overlay) {
    
    const openSidebar = () => {
      sidebar.classList.remove('-translate-x-full');
      overlay.classList.remove('hidden');
    };

    const closeSidebar = () => {
      sidebar.classList.add('-translate-x-full');
      overlay.classList.add('hidden');
    };

    // Abrir/Cerrar con el botón hamburguesa
    toggleButton.addEventListener('click', (e) => {
      e.stopPropagation(); // Evita que el click se propague a otros elementos
      if (sidebar.classList.contains('-translate-x-full')) {
        openSidebar();
      } else {
        closeSidebar();
      }
    });

    // Cerrar al hacer click en el overlay
    overlay.addEventListener('click', closeSidebar);
  }
});
// --- FIN: Código para Sidebar Responsivo ---

/* ... aquí va el resto de tu código de panelAdmin.js ...
*/