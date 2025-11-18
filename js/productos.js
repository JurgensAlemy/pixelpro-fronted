// js/productos.js
// ¡ESTE SCRIPT SÓLO DEBE CARGARSE EN "productos.html"!

// Variables para el modal
let modalInstance = null;
let detalleModal = null;
let productoActualParaAgregar = null;

document.addEventListener('DOMContentLoaded', function () {
    detalleModal = document.getElementById('detalleModal');
    
    // Verificación de seguridad
    if (!detalleModal) {
         console.warn("No se encontró 'detalleModal'. Este script es para productos.html");
         return; 
    }
    
    modalInstance = new bootstrap.Modal(detalleModal);

    // Asignar evento a TODOS los botones "Ver Detalles"
    document.querySelectorAll('.producto .btn-outline-primary').forEach(boton => {
        boton.addEventListener('click', function (e) {
            e.preventDefault();
            
            const tarjeta = this.closest('.producto');
            const nombre = tarjeta.dataset.nombre;
            const descripcion = tarjeta.dataset.descripcion;
            const precioTexto = tarjeta.querySelector('.text-primary').textContent.replace('S/.', '');
            const precio = parseFloat(precioTexto);
            const imagen = tarjeta.querySelector('.card-img-top').src;

            productoActualParaAgregar = {
                id: nombre.toLowerCase().replace(/ /g, '-'),
                nombre: nombre,
                precio: precio,
                imagen: imagen
            };

            document.getElementById('detalleModalLabel').textContent = nombre;
            document.getElementById('detalleTitulo').textContent = nombre;
            document.getElementById('detalleDescripcion').textContent = descripcion;
            document.getElementById('detallePrecio').textContent = precio.toFixed(2);
            document.getElementById('detalleImagen').src = imagen;
            document.getElementById('cantidad').value = 1;

            modalInstance.show();
        });
    });

    // Lógica del modal de carrito (si existe en esta página)
    const modalCarrito = document.getElementById('carritoModal');
    if (modalCarrito) {
        // Cuando el modal se vaya a ABRIR, actualiza su contenido.
        modalCarrito.addEventListener('show.bs.modal', () => {
            // "mostrarCarrito()" ahora vive en carrito.js,
            // pero si decidimos moverla a global, esto funcionaría.
            // Por ahora, lo dejamos así.
            // Si tienes un modal de carrito en productos, necesitaremos
            // la función "mostrarCarrito" también en cart-global.js
        });
    }
});

// Esta es la función que se llama desde tu modal
function agregarAlCarrito() {
    if (!productoActualParaAgregar) return;

    const cantidad = parseInt(document.getElementById('cantidad').value) || 1;

    // 1. Cargar el carrito (función de cart-global.js)
    let carrito = getCarritoDesdeStorage();

    const productoExistente = carrito.productos.find(p => p.id === productoActualParaAgregar.id);

    if (productoExistente) {
        productoExistente.cantidad += cantidad;
    } else {
        carrito.productos.push({
            ...productoActualParaAgregar,
            cantidad: cantidad
        });
    }

    // 3. Guardar el carrito (función de cart-global.js)
    guardarCarritoEnStorage(carrito);

    modalInstance.hide();
    
    // Si no tienes esta función, puedes borrar la línea
    if(typeof mostrarNotificacion === 'function') {
        mostrarNotificacion(`${productoActualParaAgregar.nombre} (x${cantidad}) agregado al carrito.`, 'success');
    }

    // 4. Actualizar contador (función de cart-global.js)
    updateCartCounter(); 
}

// Función de Notificación (Opcional, si la usas)
function mostrarNotificacion(mensaje, tipo) {
    const notificacion = document.createElement('div');
    notificacion.className = `alert alert-${tipo === 'error' ? 'danger' : tipo} alert-dismissible fade show position-fixed`;
    notificacion.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notificacion.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(notificacion);

    setTimeout(() => {
        if (notificacion.parentNode) {
            notificacion.remove();
        }
    }, 3000);
}