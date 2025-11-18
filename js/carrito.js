// js/carrito.js
// ¡ESTE SCRIPT SÓLO DEBE CARGARSE EN "carrito.html"!

/**
 * Función de ayuda para actualizar el total en localStorage
 * para que la página de pago lo pueda leer.
 * Se llama CADA VEZ que se redibuja el carrito.
 */
function actualizarTotalLocalStorage() {
    const carrito = getCarritoDesdeStorage(); // De cart-global.js
    const total = carrito.productos.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
    localStorage.setItem('totalPago', total);
}

/**
 * Muestra los productos en la página principal del carrito.
 */
function mostrarCarrito() {
    const contenedor = document.getElementById("contenidoCarrito");
    
    if (!contenedor) {
        console.warn("No se encontró 'contenidoCarrito'. Este script es para carrito.html");
        return; 
    }

    const carrito = getCarritoDesdeStorage(); // De cart-global.js
    contenedor.innerHTML = "";

    if (carrito.productos.length === 0) {
        contenedor.innerHTML = "<p class='text-center'>Tu carrito está vacío 🛒</p>";
        actualizarTotalLocalStorage(); // Pone el total en 0
        return;
    }

    let total = 0;
    carrito.productos.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;

        // --- INICIO DE CAMBIO DE DISEÑO ---
        // Se ha reestructurado para que los controles de cantidad estén a la izquierda
        // y el subtotal/basurero estén a la derecha.
        contenedor.innerHTML += `
            <div class="d-flex align-items-center justify-content-between border-bottom py-2">
                
                <div class="d-flex align-items-center">
                    <img src="${item.imagen}" width="80" class="me-3 rounded" style="object-fit:cover;height:80px;">
                    <div class="flex-grow-1">
                        <strong>${item.nombre}</strong><br>
                        
                        <div class="d-flex align-items-center mt-2">
                            <div class="input-group input-group-sm" style="width: 120px;">
                                <button class="btn btn-outline-secondary" type="button" onclick="disminuirCantidad(${index})">
                                    <i class="bi bi-dash"></i>
                                </button>
                                <input type="text" class="form-control text-center" value="${item.cantidad}" readonly aria-label="Cantidad">
                                <button class="btn btn-outline-secondary" type="button" onclick="aumentarCantidad(${index})">
                                    <i class="bi bi-plus"></i>
                                </button>
                            </div>
                            <small class="text-muted ms-3">Precio: S/.${item.precio.toFixed(2)}</small>
                        </div>
                    </div>
                </div>

                <div class="text-end">
                    <strong class="d-block mb-2">S/.${subtotal.toFixed(2)}</strong>
                    <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${index})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
        // --- FIN DE CAMBIO DE DISEÑO ---
    });

    // Añade el botón de pago
    contenedor.innerHTML += `
        <div class="text-end mt-4">
            <h4 class="fw-bold">Total: S/.${total.toFixed(2)}</h4>
            <button class="btn btn-success btn-lg" onclick="realizarPago()">Proceder al pago</button>
        </div>
    `;
    
    // Actualiza el total en localStorage CADA VEZ que se dibuja el carrito
    actualizarTotalLocalStorage();
}

// --- NUEVAS FUNCIONES DE CANTIDAD ---

/**
 * Aumenta la cantidad de un item en el carrito.
 */
function aumentarCantidad(index) {
    let carrito = getCarritoDesdeStorage(); // De cart-global.js
    if (carrito.productos[index]) {
        carrito.productos[index].cantidad += 1;
    }
    guardarCarritoEnStorage(carrito); // De cart-global.js
    mostrarCarrito(); // Redibuja el carrito
    updateCartCounter(); // De cart-global.js (actualiza el header)
}

/**
 * Disminuye la cantidad de un item en el carrito.
 * Si la cantidad llega a 0, elimina el producto.
 */
function disminuirCantidad(index) {
    let carrito = getCarritoDesdeStorage();
    if (carrito.productos[index]) {
        carrito.productos[index].cantidad -= 1;
        
        // Si la cantidad es 0 o menos, elimina el producto del array
        if (carrito.productos[index].cantidad <= 0) {
            carrito.productos.splice(index, 1);
        }
    }
    guardarCarritoEnStorage(carrito);
    mostrarCarrito(); // Redibuja el carrito
    updateCartCounter(); // De cart-global.js (actualiza el header)
}

// --- FUNCIONES EXISTENTES (SIN CAMBIOS FUNCIONALES) ---

/**
 * Elimina un producto del carrito (acción del botón de basura).
 */
function eliminarProducto(index) {
    let carrito = getCarritoDesdeStorage();
    carrito.productos.splice(index, 1); // Elimina el item por su índice
    guardarCarritoEnStorage(carrito);
    
    mostrarCarrito(); // Redibuja
    updateCartCounter(); // Actualiza header
}

/**
 * Procede a la página de pago.
 */
function realizarPago() {
    const carrito = getCarritoDesdeStorage();
    if (carrito.productos.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }
    
    // No necesita actualizar el total, porque 'mostrarCarrito' ya lo hizo.
    window.location.href = "pago.html";
}

// Se ejecuta SÓLO en carrito.html para pintar la lista
document.addEventListener("DOMContentLoaded", () => {
    mostrarCarrito();
});