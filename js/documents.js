// js/documents.js

function generateDocumentHtml(order, buyerName, docType, extraData = {}) {
    if (!order || !order.productos || !order.productos.length) {
        return '<p class="text-center text-muted">No hay datos de la compra para mostrar.</p>';
    }

    const today = new Date().toLocaleDateString("es-PE");
    const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString("es-PE"); // 14 días
    const documentNumber = docType === 'boleta' ? 'B001-00456' : 'F001-00123';
    const documentTitle = docType === 'boleta' ? 'Boleta de Venta' : 'Factura Electrónica';
    const igvRate = 0.18; // 18%

    // --- CÁLCULO DE TOTALES ---
    const totalFinal = parseFloat(order.total);
    const subtotalSinIGV = (totalFinal / (1 + igvRate));
    const igvCalculado = totalFinal - subtotalSinIGV;

    // --- DATOS DEL COMPRADOR (¡MEJORADO!) ---
    // Leemos los datos específicos que guardó pago.js
    const docNum = extraData.dni || '----------'; // 'dni' es el nombre del campo en extraData
    const direccion = extraData.direccion || 'No especificada';
    const tipoPago = extraData.metodoPago || 'No especificado';

    let buyerDetailsHtml;

    if (docType === 'factura') {
        buyerDetailsHtml = `
            <h5>Factura a:</h5>
            <p class="mb-0"><strong>Razón Social:</strong> ${buyerName || 'No especificada'}</p>
            <p class="mb-0"><strong>Dirección:</strong> ${direccion}</p>
            <p class="mb-0"><strong>RUC:</strong> ${docNum}</p>
        `;
    } else { // 'boleta'
        buyerDetailsHtml = `
            <h5>Cliente:</h5>
            <p class="mb-0"><strong>Nombre:</strong> ${buyerName || 'Consumidor Final'}</p>
            <p class="mb-0"><strong>Dirección:</strong> ${direccion}</p>
            <p class="mb-0"><strong>DNI:</strong> ${docNum}</p>
        `;
    }

    // --- HTML DE LA TABLA DE PRODUCTOS ---
    let productRowsHtml = "";
    order.productos.forEach(p => {
        const precioUnitarioSinIGV = parseFloat(p.precio) / (1 + igvRate);
        const importeLineaSinIGV = precioUnitarioSinIGV * p.cantidad;
        productRowsHtml += `
            <tr>
                <td><strong>${p.nombre}</strong></td>
                <td class="text-center">${p.cantidad}</td>
                <td>Unidad</td>
                <td class="text-end">S/.${precioUnitarioSinIGV.toFixed(2)}</td>
                <td class="text-center">18%</td>
                <td class="text-end">S/.${importeLineaSinIGV.toFixed(2)}</td>
            </tr>
        `;
    });

    // --- PLANTILLA HTML COMPLETA ---
    return `
        <div class="boleta-imprimible p-4 p-md-5">
            
            <div class="row boleta-header pb-3 mb-4">
                <div class="col-6">
                    <img src="../assets/icons/logo-pixelpro.webp" alt="Logo PixelPro" class="boleta-logo">
                    <p class="mb-0 text-muted">La mejor tienda de accesorios</p>
                </div>
                <div class="col-6 text-end">
                    <p class="mb-0">Av. Siempre Viva 123, Lima, Perú</p>
                    <p class="mb-0">RUC: 20123456789</p>
                    <p class="mb-0">consultas@pixelpro.com</p>
                    <p class="mb-0">+51 987 654 321</p>
                    <p class="mb-0">www.pixelpro.com</p>
                </div>
            </div>

            <div class="row boleta-info mb-4">
                <div class="col-6">
                    ${buyerDetailsHtml} </div>
                <div class="col-6 text-end">
                    <h4 class="mb-1">${documentTitle}</h4>
                    <p class="mb-1"><strong>Nº:</strong> ${documentNumber}</p>
                    <p class="mb-1"><strong>Fecha de factura:</strong> ${today}</p>
                    <p class="mb-0"><strong>Fecha de vencimiento:</strong> ${dueDate}</p>
                </div>
            </div>

            <table class="table boleta-tabla">
                <thead class="table-light">
                    <tr>
                        <th scope="col">Descripción</th>
                        <th scope="col" class="text-center">Cantidad</th>
                        <th scope="col">Unidad</th>
                        <th scope="col" class="text-end">Precio</th>
                        <th scope="col" class="text-center">IGV</th>
                        <th scope="col" class="text-end">Importe</th>
                    </tr>
                </thead>
                <tbody>
                    ${productRowsHtml}
                </tbody>
            </table>

            <div class="row boleta-totales justify-content-end mt-4">
                <div class="col-6 col-md-4">
                    <table class="table table-borderless">
                        <tbody>
                            <tr>
                                <td class="fw-bold">Subtotal:</td>
                                <td class="text-end">S/.${subtotalSinIGV.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td class="fw-bold">IGV (18%):</td>
                                <td class="text-end">S/.${igvCalculado.toFixed(2)}</td>
                            </tr>
                            <tr class="boleta-gran-total">
                                <td class="fw-bold fs-5">Importe a pagar (S/.):</td>
                                <td class="fw-bold fs-5 text-end">S/.${totalFinal.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="boleta-footer mt-5">
                <h6 class="fw-bold">Términos y Condiciones</h6>
                <p class="small text-muted">
                    A pagar en los 14 siguientes días a la producción del servicio.
                    Método de pago: ${tipoPago}
                </p>
                <hr>
                <p class="small text-muted text-center">
                    PixelPro S.A.C. - RUC 20123456789 - Todos los derechos reservados.
                </p>
            </div>

        </div>
    `;
}