// js/pago.js

document.addEventListener("DOMContentLoaded", () => {
    // === ELEMENTOS DEL FORMULARIO ===
    const metodoPago = document.getElementById('metodoPago');
    const camposPago = document.getElementById('camposPago');
    const resumenPedido = document.getElementById('resumenPedido');
    const totalPagoEl = document.getElementById('totalPago');
    const formPago = document.getElementById('formPago');
    const btnConfirmar = document.getElementById('btnConfirmar');
    const nombre = document.getElementById('nombre');
    const dni = document.getElementById('dni');
    const telefono = document.getElementById('telefono');
    const fechaNac = document.getElementById('fechaNacimiento');
    const edadFeedback = document.getElementById('edadFeedback');

    // --- NUEVOS ELEMENTOS ---
    const tipoDocBoleta = document.getElementById('tipoDocBoleta');
    const tipoDocFactura = document.getElementById('tipoDocFactura');
    const campoRazonSocial = document.getElementById('campoRazonSocial');
    const razonSocial = document.getElementById('razonSocial');
    const labelNombre = document.getElementById('labelNombre');
    const labelDNI = document.getElementById('labelDNI');
    const feedbackDNI = document.getElementById('feedbackDNI');
    // --- FIN NUEVOS ELEMENTOS ---

    if (!formPago) return; // Salir si no estamos en pago.html

    // === UTILIDADES ===
    function onlyDigits(str) { return str.replace(/\D/g, ''); }
    function onlyLetters(str) { return str.replace(/[^a-zA-Z\sñÑáéíóúÁÉÍÓÚ]/g, ''); }
    function luhnValid(number) {
        const digits = number.split('').reverse().map(d => parseInt(d, 10));
        let sum = 0;
        for (let i = 0; i < digits.length; i++) {
            let d = digits[i];
            if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
            sum += d;
        }
        return sum % 10 === 0;
    }
    function isExpiryValid(mmYY) {
        const parts = mmYY.split('/');
        if (parts.length !== 2) return false;
        let mm = parseInt(parts[0], 10);
        let yy = parseInt(parts[1], 10);
        if (!mm || !yy) return false;
        if (parts[1].length === 2) yy += 2000;
        if (mm < 1 || mm > 12) return false;
        const lastDay = new Date(yy, mm, 0, 23, 59, 59);
        return lastDay >= new Date();
    }
    function esMayorDeEdad(fechaStr) {
        if (!fechaStr) return false;
        const hoy = new Date();
        const nac = new Date(fechaStr);
        let edad = hoy.getFullYear() - nac.getFullYear();
        const m = hoy.getMonth() - nac.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
        return edad >= 18;
    }

    // --- NUEVA FUNCIÓN: Actualizar campos del formulario ---
    function actualizarCamposDocumento() {
        // Asegurarse de que los elementos existan antes de usarlos
        if (!tipoDocBoleta || !tipoDocFactura) return; 
        
        const tipo = document.querySelector('input[name="tipoDocumento"]:checked').value;

        if (tipo === 'factura') {
            // Mostrar campos de Factura
            campoRazonSocial.style.display = 'block';
            razonSocial.required = true;
            
            // Cambiar etiquetas y validación para RUC
            labelNombre.textContent = 'Nombre de Contacto';
            labelDNI.textContent = 'RUC';
            dni.maxLength = 11;
            dni.value = onlyDigits(dni.value).slice(0, 11); // Cortar si se cambia
            feedbackDNI.textContent = 'El RUC debe tener 11 dígitos.';
            
            nombre.required = true; 

        } else { // 'boleta'
            // Ocultar campos de Factura
            campoRazonSocial.style.display = 'none';
            razonSocial.required = false;
            
            // Cambiar etiquetas y validación para DNI
            labelNombre.textContent = 'Nombres y Apellidos';
            labelDNI.textContent = 'DNI';
            dni.maxLength = 8;
            dni.value = onlyDigits(dni.value).slice(0, 8); // Cortar si se cambia
            feedbackDNI.textContent = 'El DNI debe tener 8 dígitos.';
            
            nombre.required = true;
        }
    }
    // --- FIN NUEVA FUNCIÓN ---
    
    // === LÓGICA PRINCIPAL ===

    // 1. Mostrar resumen
    function mostrarResumen() {
        const carrito = getCarritoDesdeStorage(); // De cart-global.js
        const total = localStorage.getItem('totalPago') || 0;

        resumenPedido.innerHTML = '';

        if (carrito.productos.length === 0) {
            resumenPedido.innerHTML = '<p class="text-center">No hay productos en el carrito.</p>';
            totalPagoEl.textContent = 'S/.0.00';
            btnConfirmar.disabled = true;
            return;
        }

        carrito.productos.forEach(item => {
            const subtotal = item.precio * item.cantidad;
            resumenPedido.innerHTML += `
                <div class="d-flex align-items-center justify-content-between mb-2">
                    <div class="d-flex align-items-center">
                        <img src="${item.imagen}" alt="${item.nombre}" class="me-2" style="width:50px;height:50px;object-fit:cover;border-radius:6px;">
                        <div>
                            <strong>${item.nombre}</strong><br>
                            <small class="small-muted">${item.cantidad} x S/.${item.precio.toFixed(2)}</small>
                        </div>
                    </div>
                    <div><strong>S/.${subtotal.toFixed(2)}</strong></div>
                </div>
            `;
        });
        totalPagoEl.textContent = `S/.${parseFloat(total).toFixed(2)}`;
    }

    // 2. Mostrar campos de pago dinámicos
    function mostrarCamposPorMetodo() {
        const m = metodoPago.value;
        camposPago.innerHTML = '';
        if (m === 'tarjeta') {
            camposPago.innerHTML = `
                <div class="mb-3">
                    <label class="form-label">Número de tarjeta</label>
                    <input id="numTarjeta" class="form-control" inputmode="numeric" maxlength="19" placeholder="XXXX XXXX XXXX XXXX" required>
                    <div class="invalid-feedback" id="numTarjetaFeedback">Número de tarjeta inválido.</div>
                </div>
                <div class="row g-2">
                    <div class="col-6">
                        <label class="form-label">Vencimiento (MM/AA)</label>
                        <input id="expTarjeta" class="form-control" placeholder="MM/AA" maxlength="5" required>
                        <div class="invalid-feedback" id="expFeedback">Tarjeta vencida o formato inválido.</div>
                    </div>
                    <div class="col-6">
                        <label class="form-label">CVV</label>
                        <input id="cvvTarjeta" class="form-control" inputmode="numeric" maxlength="4" placeholder="CVV" required>
                        <div class="invalid-feedback" id="cvvFeedback">CVV inválido.</div>
                    </div>
                </div>
            `;

            const num = document.getElementById('numTarjeta');
            const exp = document.getElementById('expTarjeta');
            const cvv = document.getElementById('cvvTarjeta');

            num.addEventListener('input', (e) => {
                let only = onlyDigits(e.target.value).slice(0, 16);
                e.target.value = only.replace(/(.{4})/g, '$1 ').trim();
            });
            cvv.addEventListener('input', (e) => {
                e.target.value = onlyDigits(e.target.value).slice(0, 4);
            });
            exp.addEventListener('input', (e) => {
                let v = onlyDigits(e.target.value).slice(0, 4);
                if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
                e.target.value = v;
            });

        } else if (m === 'yape' || m === 'plin') {
            camposPago.innerHTML = `
                <div class="mb-3">
                    <label class="form-label">Teléfono asociado (${m.toUpperCase()})</label>
                    <input id="telPago" class="form-control" inputmode="numeric" maxlength="9" placeholder="Ej: 987654321" required>
                    <div class="invalid-feedback">Ingresa un teléfono de 9 dígitos.</div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Subir comprobante (opcional)</label>
                    <input id="comprobante" class="form-control" type="file" accept="image/*,application/pdf">
                    <div class="small-muted">También puedes pagar con el QR en tu app y luego subir el comprobante.</div>
                </div>
            `;
            const tel = document.getElementById('telPago');
            tel.addEventListener('input', e => { e.target.value = onlyDigits(e.target.value).slice(0, 9); });
        } else if (m === 'transferencia') {
            camposPago.innerHTML = `
                <div class="mb-3">
                    <label class="form-label">Banco remitente</label>
                    <input id="banco" class="form-control" placeholder="Banco" required>
                    <div class="invalid-feedback">Ingresa el banco.</div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Número de operación (opcional)</label>
                    <input id="operacion" class="form-control" placeholder="N° operación">
                </div>
            `;
        }
    }

    // 3. Validaciones específicas de tarjeta
    function validarTarjetaCampos() {
        const numEl = document.getElementById('numTarjeta');
        const expEl = document.getElementById('expTarjeta');
        const cvvEl = document.getElementById('cvvTarjeta');
        let ok = true;

        if (!numEl || !expEl || !cvvEl) return true;

        const numOnly = onlyDigits(numEl.value);
        if (numOnly.length < 13 || numOnly.length > 16 || !luhnValid(numOnly)) {
            numEl.classList.add('is-invalid');
            ok = false;
        } else { numEl.classList.remove('is-invalid'); numEl.classList.add('is-valid'); }

        if (!isExpiryValid(expEl.value)) {
            expEl.classList.add('is-invalid'); ok = false;
        } else { expEl.classList.remove('is-invalid'); expEl.classList.add('is-valid'); }

        const cvvOnly = onlyDigits(cvvEl.value);
        if (cvvOnly.length < 3 || cvvOnly.length > 4) {
            cvvEl.classList.add('is-invalid'); ok = false;
        } else { cvvEl.classList.remove('is-invalid'); cvvEl.classList.add('is-valid'); }

        return ok;
    }

    // 4. Validaciones en tiempo real (¡ACTUALIZADO!)
    nombre.addEventListener('input', (e) => {
        e.target.value = onlyLetters(e.target.value);
    });
    
    dni.addEventListener('input', (e) => {
        // Validación inteligente: 8 para DNI, 11 para RUC
        const tipo = document.querySelector('input[name="tipoDocumento"]:checked').value;
        const max = (tipo === 'factura') ? 11 : 8;
        e.target.value = onlyDigits(e.target.value).slice(0, max);
    });

    telefono.addEventListener('input', (e) => {
        e.target.value = onlyDigits(e.target.value).slice(0, 9);
    });

    // 5. Validación de Submit (¡ACTUALIZADO!)
    formPago.addEventListener('submit', function(e) {
        e.preventDefault();
        
        formPago.classList.remove('was-validated');
        document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        
        let esValido = true;

        if (!formPago.checkValidity()) {
            formPago.classList.add('was-validated');
            esValido = false;
        }

        if (!esMayorDeEdad(fechaNac.value)) {
            fechaNac.classList.add('is-invalid');
            edadFeedback.style.display = 'block';
            esValido = false;
        }

        // --- VALIDACIÓN DNI/RUC ---
        const tipoDoc = document.querySelector('input[name="tipoDocumento"]:checked').value;
        if (tipoDoc === 'factura') {
            // Validar RUC (requerido y 11 dígitos)
            if (dni.value.length !== 11) {
                dni.classList.add('is-invalid');
                feedbackDNI.textContent = 'El RUC debe tener 11 dígitos.';
                esValido = false;
            }
            // Validar Razón Social (requerido)
            if (!razonSocial.value) {
                razonSocial.classList.add('is-invalid');
                esValido = false;
            }
        } else {
            // Validar DNI (requerido y 8 dígitos)
            if (dni.value.length !== 8) {
                dni.classList.add('is-invalid');
                feedbackDNI.textContent = 'El DNI debe tener 8 dígitos.';
                esValido = false;
            }
        }
        // --- FIN VALIDACIÓN DNI/RUC ---

        if (telefono.value.length !== 9) {
            telefono.classList.add('is-invalid');
            if (telefono.nextElementSibling) telefono.nextElementSibling.textContent = 'El teléfono debe tener 9 dígitos.';
            esValido = false;
        }

        const metodo = metodoPago.value;
        if (!metodo) {
            metodoPago.classList.add('is-invalid');
            esValido = false;
        }

        if (metodo === 'tarjeta') {
            if (!validarTarjetaCampos()) {
                esValido = false;
            }
        }
        
        if (metodo === 'yape' || metodo === 'plin') {
            const telEl = document.getElementById('telPago');
            if (!telEl || onlyDigits(telEl.value).length !== 9) {
                if (telEl) telEl.classList.add('is-invalid');
                esValido = false;
            } else if(telEl) { telEl.classList.remove('is-invalid'); }
        }

        if (!esValido) {
            return;
        }

        btnConfirmar.disabled = true;
        btnConfirmar.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Procesando...`;

        // --- GUARDAR EN LOCALSTORAGE (¡ACTUALIZADO!) ---
        setTimeout(() => {
            const carrito = getCarritoDesdeStorage();
            const total = localStorage.getItem('totalPago') || 0;
            
            // Guardar Razón Social si es factura, si no, el nombre normal
            const nombreComprador = (tipoDoc === 'factura' && razonSocial.value) ? razonSocial.value : nombre.value;
            
            localStorage.setItem('lastOrder', JSON.stringify({ 
                productos: carrito.productos, 
                total: total, 
                buyer: nombreComprador, // Usar Razón Social o Nombre
                buyerDocTipo: tipoDoc, // 'boleta' o 'factura'
                buyerDocNum: dni.value.trim(), // DNI o RUC
                buyerAddress: document.getElementById('direccion').value.trim(),
                paymentMethod: metodoPago.value
            }));
            
            localStorage.removeItem('pixelpro_carrito');
            localStorage.removeItem('totalPago');
            
            window.location.href = "thankyou.html";
        }, 1800);
    });

    // === INICIALIZACIÓN ===
    mostrarResumen();
    metodoPago.addEventListener('change', mostrarCamposPorMetodo);
    
    // --- NUEVOS LISTENERS ---
    // Añadir listeners solo si los botones existen
    if (tipoDocBoleta && tipoDocFactura) {
        tipoDocBoleta.addEventListener('change', actualizarCamposDocumento);
        tipoDocFactura.addEventListener('change', actualizarCamposDocumento);
    }
    // Ejecutar una vez al cargar por si acaso
    actualizarCamposDocumento(); 
});