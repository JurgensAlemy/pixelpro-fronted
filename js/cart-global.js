// js/cart-global.js

// === CONFIGURACIÓN GLOBAL ===
const STORAGE_KEY = 'pixelpro_carrito';

// === FUNCIONES AUXILIARES GLOBALES ===
// Estas se usarán en productos.js y carrito.js
function getCarritoDesdeStorage() {
    const carritoString = localStorage.getItem(STORAGE_KEY);
    return carritoString ? JSON.parse(carritoString) : { productos: [], descuento: 0, envio: 0 };
}

function guardarCarritoEnStorage(carrito) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(carrito));
}

// === LÓGICA GLOBAL DEL CONTADOR DEL HEADER ===
// Esta es la ÚNICA versión de esta función
function updateCartCounter() {
    const cart = getCarritoDesdeStorage();
    const totalQuantity = cart.productos.reduce((total, item) => total + item.cantidad, 0);
    const cartBadge = document.getElementById('cart-count-badge');

    if (cartBadge) {
        // ¡ARREGLO PARA EL "0"!
        // Simplemente actualizamos el número.
        // Ya no se ocultará, por lo que verás el "0".
        cartBadge.textContent = totalQuantity;
    }
}

// Se ejecuta en TODAS las páginas para actualizar el contador
// en cuanto el header.html se termine de cargar.
document.addEventListener("component:loaded", (event) => {
    if (event.detail.id === "header") {
        updateCartCounter();
    }
});

// También se ejecuta al cargar la página, por si acaso.
document.addEventListener("DOMContentLoaded", () => {
    updateCartCounter();
});