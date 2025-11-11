document.addEventListener("DOMContentLoaded", () => {
    const productos = document.querySelectorAll(".producto");

    // --- FILTRO POR PARÁMETROS EN LA URL (para entrar directo desde el header) ---
    const urlParams = new URLSearchParams(window.location.search);
    const categoriaParam = urlParams.get("categoria");

    if (categoriaParam) {
        productos.forEach(prod => {
            prod.style.display =
                categoriaParam === "all" || prod.dataset.categoria === categoriaParam
                    ? "block"
                    : "none";
        });
    }

    // --- Filtro por categorías (event delegation en esta página) ---
    document.addEventListener("click", e => {
        const link = e.target.closest(".category-link");
        if (link) {
            e.preventDefault();
            const categoria = link.getAttribute("data-category");

            // Redirigir si no estamos en productos.html
            if (!document.querySelector("#listaProductos")) {
                window.location.href = `/pages/productos.html?categoria=${categoria}`;
                return;
            }

            productos.forEach(prod => {
                prod.style.display =
                    categoria === "all" || prod.dataset.categoria === categoria
                        ? "block"
                        : "none";
            });
        }
    });
});
document.addEventListener("DOMContentLoaded", () => {
    const botonesDetalles = document.querySelectorAll(".producto .btn");

    botonesDetalles.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();

            const productoCard = btn.closest(".producto");
            const titulo = productoCard.getAttribute("data-nombre");
            const imagen = productoCard.querySelector("img").src;
            const precio = productoCard.querySelector(".text-primary").textContent.replace("S/.", "").trim();

            // Descripción ficticia (puedes personalizarla por producto)
            const descripcion = productoCard.getAttribute("data-descripcion") || "Descripción no disponible.";

            cargarDetalle(titulo, imagen, descripcion, precio);

            // Abrir modal
            const detalleModal = new bootstrap.Modal(document.getElementById("detalleModal"));
            detalleModal.show();
        });
    });
});

function cargarDetalle(titulo, imagen, descripcion, precio) {
    document.getElementById("detalleTitulo").textContent = titulo;
    document.getElementById("detalleImagen").src = imagen;
    document.getElementById("detalleDescripcion").textContent = descripcion;
    document.getElementById("detallePrecio").textContent = precio;
}

function agregarAlCarrito() {
    const cantidad = document.getElementById("cantidad").value;
    const titulo = document.getElementById("detalleTitulo").textContent;
    alert(`Se agregó ${cantidad} unidad(es) de "${titulo}" al carrito.`);
}
