document.addEventListener("DOMContentLoaded", () => {
    // buscar contenedor y botón probando varios selectores por si hay inconsistencias
    const contenedorSelectors = ['#productosContainer', '#masPopulares', '#mas-populares', '.productos-container'];
    const botonSelectors = ['#cargarMas', '#btnMasPopulares', '.btn-cargar-mas'];

    const contenedor = contenedorSelectors.map(s => document.querySelector(s)).find(Boolean);
    const boton = botonSelectors.map(s => document.querySelector(s)).find(Boolean);

    if (!contenedor) {
        console.warn('cargarMas: no se encontró el contenedor de productos. Buscadores probados:', contenedorSelectors);
        return;
    }
    if (!boton) {
        console.warn('cargarMas: no se encontró el botón "Cargar más". Buscadores probados:', botonSelectors);
        return;
    }

    const productos = Array.from(contenedor.querySelectorAll(".producto"));
    if (!productos.length) {
        console.warn('cargarMas: no se encontraron elementos .producto dentro del contenedor.');
        boton.style.display = 'none';
        return;
    }

    // función para saber si un elemento está visible (según CSS computado)
    const isVisible = el => window.getComputedStyle(el).display !== "none";

    // contar visibles iniciales (si todos están ocultos asumimos mostrar 2)
    let visibles = productos.reduce((n, p) => n + (isVisible(p) ? 1 : 0), 0);
    if (visibles === 0) {
        // si quieres mostrar 0 al inicio, cambia la siguiente línea a 0; por defecto mostramos 2
        visibles = Math.min(2, productos.length);
        for (let i = 0; i < visibles; i++) productos[i].style.display = "block";
    }

    const incremento = 2; // cuántos mostrar cada click (ajusta si quieres)

    boton.addEventListener("click", () => {
        let mostrados = 0;
        for (let i = visibles; i < productos.length && mostrados < incremento; i++) {
            productos[i].style.display = "block";
            mostrados++;
        }
        visibles += mostrados;

        if (visibles >= productos.length) {
            boton.style.display = "none";
        }
    });
});
