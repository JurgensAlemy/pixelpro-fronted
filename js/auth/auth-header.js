import { me, logout } from "./auth-api.js";

async function renderHeaderUser() {
  const mount = document.querySelector("#header-user");
  if (!mount) return;

  try {
    const user = await me();

    if (user?.authenticated) {
      // Si está autenticado, reemplazamos el ícono por el menú dropdown
      mount.innerHTML = `
        <div class="dropdown">
          <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
            <i class="bi bi-person fs-5 me-1"></i>${user.email}
          </a>
          <ul class="dropdown-menu dropdown-menu-end">
            <li><a class="dropdown-item" href="/pages/perfil.html">Ver perfil</a></li>
            <li><a class="dropdown-item" href="/pages/pedidos.html">Mis pedidos</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#" id="logoutBtn">Cerrar sesión</a></li>
          </ul>
        </div>
      `;

      document.getElementById("logoutBtn").addEventListener("click", async () => {
        try {
          await logout();
        } catch (err) {
          console.warn("Error en logout:", err);
        } finally {
          location.reload();
        }
      });
    }
    // Si no está autenticado, NO tocamos nada:
    // Se mantiene el icono <a href="login.html"> que ya está en header.html

  } catch (e) {
    console.warn("No se pudo consultar sesión:", e);
    // En caso de error (backend caído), no hacemos nada:
    // se mantiene el ícono dibujado en header.html
  }
}

// Cuando el header se haya cargado
document.addEventListener("component:loaded", (ev) => {
  if (ev.detail.id === "header") {
    renderHeaderUser();
  }
});
