// js/buscador.js
document.addEventListener("DOMContentLoaded", () => {

  // Inicializa el buscador cuando los elementos del header estén presentes
  function setupSearch() {
    const searchForm = document.querySelector("#searchForm");
    const searchInput = document.querySelector("#searchInput");
    const suggestions = document.querySelector("#suggestions");

    // Elementos móviles
    const searchFormMobile = document.querySelector("#searchFormMobile");
    const searchInputMobile = document.querySelector("#searchInputMobile");
    const suggestionsMobile = document.querySelector("#suggestionsMobile");

    if ((!searchForm || !searchInput || !suggestions) &&
      (!searchFormMobile || !searchInputMobile || !suggestionsMobile)) {
      return false;
    }

    // Helpers
    const getProductos = () => Array.from(document.querySelectorAll(".producto"));

    const clearSuggestions = (suggestionsElement) => {
      if (suggestionsElement) suggestionsElement.innerHTML = "";
    };

    const showOnlyProductByName = (nombreBuscado) => {
      const productos = getProductos();
      const txt = nombreBuscado.toLowerCase();
      productos.forEach(prod => {
        const nombre = (prod.dataset.nombre || "").toLowerCase();
        prod.style.display = nombre.includes(txt) ? "block" : "none";
      });
    };

    const addSuggestionItem = (text, onClick, suggestionsElement, imgSrc = null, precio = null) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "list-group-item list-group-item-action d-flex align-items-center gap-3 py-2";
      item.style.cursor = "pointer";

      if (imgSrc) {
        const img = document.createElement("img");
        img.src = imgSrc;
        img.alt = text;
        img.style.width = "50px";
        img.style.height = "50px";
        img.style.objectFit = "cover";
        img.style.borderRadius = "4px";
        item.appendChild(img);
      }

      const textContainer = document.createElement("div");
      textContainer.className = "d-flex flex-column align-items-start flex-grow-1";

      const nameSpan = document.createElement("span");
      nameSpan.textContent = text;
      nameSpan.className = "fw-semibold";
      textContainer.appendChild(nameSpan);

      if (precio) {
        const priceSpan = document.createElement("span");
        priceSpan.textContent = `S/.${precio}`;
        priceSpan.className = "text-primary small";
        textContainer.appendChild(priceSpan);
      }

      item.appendChild(textContainer);
      item.addEventListener("click", onClick);
      suggestionsElement.appendChild(item);
    };

    // Maneja input (sugerencias)
    const createOnInput = (input, suggestionsElement) => () => {
      const texto = (input.value || "").toLowerCase().trim();
      clearSuggestions(suggestionsElement);
      if (texto.length === 0) return;

      const productos = getProductos();

      // Si no estamos en la página de productos → sugerir enlace a productos.html?q=...
      if (!document.querySelector("#listaProductos") || productos.length === 0) {
        const link = document.createElement("a");
        link.className = "list-group-item list-group-item-action";
        link.href = `/pages/productos.html?q=${encodeURIComponent(texto)}`;
        link.textContent = `Buscar "${texto}" en productos`;
        suggestionsElement.appendChild(link);
        return;
      }

      // Estamos en productos.html → buscar coincidencias en los nombres
      const resultados = productos
        .filter(p => {
          const nombre = (p.dataset.nombre || "").toLowerCase();
          return nombre.includes(texto);
        })
        .map(p => ({
          nombre: p.dataset.nombre || "",
          imagen: p.querySelector("img")?.src || "",
          precio: p.querySelector(".text-primary")?.textContent.replace("S/.", "").trim() || ""
        }));

      // Evitar duplicados por nombre
      const unicos = [];
      const nombresVistos = new Set();
      resultados.forEach(item => {
        if (!nombresVistos.has(item.nombre)) {
          nombresVistos.add(item.nombre);
          unicos.push(item);
        }
      });

      if (unicos.length === 0) {
        suggestionsElement.innerHTML = `<div class="list-group-item text-muted">Sin resultados</div>`;
        return;
      }

      unicos.forEach(item => {
        addSuggestionItem(item.nombre, () => {
          showOnlyProductByName(item.nombre);
          input.value = item.nombre;
          clearSuggestions(suggestionsElement);
        }, suggestionsElement, item.imagen, item.precio);
      });
    };

    // Manejar submit (lupa)
    const createOnSubmit = (input, suggestionsElement) => (e) => {
      e.preventDefault();
      const texto = (input.value || "").toLowerCase().trim();
      if (!texto) return;

      // Si no estamos en productos.html → redirigir con ?q=
      if (!document.querySelector("#listaProductos")) {
        window.location.href = `/pages/productos.html?q=${encodeURIComponent(texto)}`;
        return;
      }

      // Si estamos en productos.html → filtrar en la misma página
      showOnlyProductByName(texto);
      clearSuggestions(suggestionsElement);
    };

    // Setup Desktop
    if (searchForm && searchInput && suggestions) {
      const onInputDesktop = createOnInput(searchInput, suggestions);
      searchInput.removeEventListener("input", onInputDesktop);
      searchInput.addEventListener("input", onInputDesktop);
      searchForm.addEventListener("submit", createOnSubmit(searchInput, suggestions));

      // Cerrar sugerencias al hacer click fuera del searchBar
      document.addEventListener("click", (e) => {
        if (!e.target.closest("#searchBar") && !e.target.closest("#suggestions")) {
          clearSuggestions(suggestions);
        }
      });

      // Si llegamos con ?q= en la URL mientras estamos en productos.html, aplica filtro inicial
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q");
      if (q && document.querySelector("#listaProductos")) {
        searchInput.value = q;
        showOnlyProductByName(q);
      }
    }

    // Setup Mobile
    if (searchFormMobile && searchInputMobile && suggestionsMobile) {
      const onInputMobile = createOnInput(searchInputMobile, suggestionsMobile);
      searchInputMobile.removeEventListener("input", onInputMobile);
      searchInputMobile.addEventListener("input", onInputMobile);
      searchFormMobile.addEventListener("submit", createOnSubmit(searchInputMobile, suggestionsMobile));

      // Cerrar sugerencias al hacer click fuera del searchBarMobile
      document.addEventListener("click", (e) => {
        if (!e.target.closest("#searchBarMobile") && !e.target.closest("#suggestionsMobile")) {
          clearSuggestions(suggestionsMobile);
        }
      });

      // Si llegamos con ?q= en la URL mientras estamos en productos.html, aplica filtro inicial
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q");
      if (q && document.querySelector("#listaProductos")) {
        searchInputMobile.value = q;
        showOnlyProductByName(q);
      }
    }

    return true;
  } // fin setupSearch

  // Intentar inicializar inmediatamente; si falla (header aún no insertado), observar cambios
  if (!setupSearch()) {
    const header = document.getElementById("header");
    if (header) {
      const observer = new MutationObserver((mutations, obs) => {
        if (setupSearch()) obs.disconnect();
      });
      observer.observe(header, { childList: true, subtree: true });
    } else {
      // Fallback a polling corto por 3s
      const poll = setInterval(() => {
        if (setupSearch()) {
          clearInterval(poll);
        }
      }, 200);
      setTimeout(() => clearInterval(poll), 3000);
    }
  }
});
