document.addEventListener("DOMContentLoaded", () => {

    function mostrarToast(mensaje, icono = '🔔') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span>${icono}</span> <span>${mensaje}</span>`;
        container.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 15);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    let rolActual = localStorage.getItem('usuario_rol') || 'Invitado';
    let nombreUsuario = localStorage.getItem('usuario_nombre') || '';

    const nav = document.querySelector('nav');
    if (nav) {

        const oldBadge = document.querySelector('.user-badge');
        if (oldBadge) oldBadge.remove();
        const oldLinkVendedor = document.querySelector('.nav-link-vendedor');
        if (oldLinkVendedor) oldLinkVendedor.remove();

        if (rolActual === 'Vendedor' || rolActual === 'Administrador') {
            const linkVendedor = document.createElement('a');
            linkVendedor.href = 'Vendedor.html';
            linkVendedor.textContent = 'Vendedor';
            linkVendedor.className = 'nav-link-vendedor';
            nav.appendChild(linkVendedor);
        }

        if (rolActual !== 'Invitado') {
            const badge = document.createElement('span');
            badge.className = 'user-badge';
            badge.innerHTML = `👤 ${nombreUsuario} (${rolActual}) <a href="#" id="btn-logout" style="color:#ef4444; 
            margin-left:8px; text-decoration:none;">Salir</a>`;
            nav.appendChild(badge);

            const btnLogout = document.querySelector('#btn-logout');
            if (btnLogout) {
                btnLogout.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.clear();
                    mostrarToast('Sesión cerrada correctamente', '👋');
                    setTimeout(() => { window.location.href = 'index.html'; }, 1000);
                });
            }
        }
    }

    if (window.location.pathname.includes('cuenta.html')) {
        if (rolActual !== 'Contratista' && rolActual !== 'Administrador') {
            mostrarToast('Acceso restringido: Exclusivo para Contratistas y Administradores.', '⛔');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }
    }

    if (window.location.pathname.includes('catalogo.html')) {
        const inputBuscar = document.querySelector('input[placeholder="Buscar producto..."]');

        if (inputBuscar) {
            inputBuscar.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                const filas = document.querySelectorAll('table tr');

                filas.forEach((fila, idx) => {
                    if (idx === 0) return;
                    const texto = fila.textContent.toLowerCase();
                    fila.style.display = texto.includes(query) ? '' : 'none';
                });
            });
        }

        const botonesAgregar = document.querySelectorAll('table button:not([disabled])');
        botonesAgregar.forEach((btn) => {
            btn.addEventListener('click', function () {
                const fila = this.closest('tr');
                const producto = fila.cells[1].textContent.trim();
                mostrarToast(`Agregaste <strong>${producto}</strong> al pedido`, '🧱');
            });
        });
    }

    if (window.location.pathname.includes('carrito.html')) {
        const tabla = document.querySelector('table');
        const h2Total = document.querySelector('h2');

        function recalcularTotal() {
            let total = 0;
            const filas = tabla.querySelectorAll('tr');

            filas.forEach((fila, idx) => {
                if (idx === 0) return;
                const celdaPrecio = fila.cells[1];
                const inputCant = fila.cells[2].querySelector('input');
                const celdaSubtotal = fila.cells[3];

                if (celdaPrecio && inputCant && celdaSubtotal) {
                    const precio = parseInt(celdaPrecio.textContent.replace('$', '').replace(/\./g, '').trim(), 10) || 0;
                    const cantidad = parseInt(inputCant.value, 10) || 0;
                    const subtotal = precio * cantidad;

                    celdaSubtotal.textContent = `$${subtotal.toLocaleString('es-CL')}`;
                    total += subtotal;
                }
            });

            if (h2Total && h2Total.textContent.includes('Total:')) {
                h2Total.textContent = `Total: $${total.toLocaleString('es-CL')}`;
            }
        }

        const inputsCantidad = document.querySelectorAll('table input[type="number"]');
        inputsCantidad.forEach(input => {
            input.addEventListener('change', () => {
                if (input.value < 1) input.value = 1;
                recalcularTotal();
            });
        });

        const botonesQuitar = document.querySelectorAll('table button');
        botonesQuitar.forEach(btn => {
            btn.classList.add('btn-danger');
            btn.addEventListener('click', function () {
                const fila = this.closest('tr');
                const nombre = fila.cells[0].textContent.trim();
                fila.remove();
                recalcularTotal();
                mostrarToast(`Se quitó ${nombre}`, '🗑️');
            });
        });

        const btnConfirmar = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Confirmar Pedido'));
        if (btnConfirmar) {
            btnConfirmar.addEventListener('click', () => {
                const despachoRadio = document.querySelector('#despacho');
                const inputDir = document.querySelector('input[placeholder="Calle, numero, comuna"]');

                if (despachoRadio && despachoRadio.checked) {
                    if (inputDir && inputDir.value.trim() === '') {
                        inputDir.classList.add('campo-error');
                        mostrarToast('Indica la dirección para el despacho', '⚠️');
                        return;
                    }
                }
                if (inputDir) inputDir.classList.remove('campo-error');

                mostrarToast('¡Pedido confirmado con éxito!', '✅');
                setTimeout(() => { window.location.href = 'pedidos.html'; }, 1800);
            });
        }
    }


    const formulario = document.querySelector('form');
    if (!formulario) return;

    if (window.location.pathname.includes('login.html')) {
        formulario.addEventListener('submit', (e) => {
            e.preventDefault();

            const inputCorreo = document.querySelector('#correo');
            const inputClave = document.querySelector('#clave');
            let hayError = false;

            [inputCorreo, inputClave].forEach(campo => {
                if (!campo.value.trim()) {
                    campo.classList.add('campo-error');
                    hayError = true;
                } else {
                    campo.classList.remove('campo-error');
                }
            });

            if (hayError) {
                mostrarToast('Por favor completa tus credenciales', '⚠️');
                return;
            }

            const valCorreo = inputCorreo.value.toLowerCase().trim();
            let rolAsignado = 'Particular';
            if (valCorreo.includes('admin')) rolAsignado = 'Administrador';
            else if (valCorreo.includes('vendedor')) rolAsignado = 'Vendedor';
            else if (valCorreo.includes('contratista') || valCorreo.includes('maestro')) rolAsignado = 'Contratista';

            localStorage.setItem('usuario_rol', rolAsignado);
            localStorage.setItem('usuario_nombre', valCorreo.split('@')[0]);

            mostrarToast(`¡Bienvenido! Rol: ${rolAsignado}`, '👷‍♂️');

            let destino = 'index.html';
            if (rolAsignado === 'Administrador') destino = 'Admin.html';
            else if (rolAsignado === 'Vendedor') destino = 'Vendedor.html';

            setTimeout(() => { window.location.href = destino; }, 1200);
        });
    }

    if (window.location.pathname.includes('registro.html')) {
        formulario.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombre = document.querySelector('#nombre');
            const correo = document.querySelector('#correo');
            const telefono = document.querySelector('#telefono');
            const direccion = document.querySelector('#direccion');
            const clave = document.querySelector('#clave');
            const clave2 = document.querySelector('#clave2');
            const tipo = document.querySelector('#tipo');

            let hayError = false;
            const campos = [nombre, correo, telefono, direccion, clave, clave2];

            campos.forEach(c => {
                if (!c.value.trim()) {
                    c.classList.add('campo-error');
                    hayError = true;
                } else {
                    c.classList.remove('campo-error');
                }
            });

            const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (correo.value.trim() && !regexCorreo.test(correo.value.trim())) {
                correo.classList.add('campo-error');
                mostrarToast('El correo no tiene un formato válido', '⚠️');
                return;
            }

            if (clave.value !== clave2.value) {
                clave.classList.add('campo-error');
                clave2.classList.add('campo-error');
                mostrarToast('Las contraseñas no coinciden', '❌');
                return;
            }

            if (hayError) {
                mostrarToast('Todos los campos son obligatorios', '⚠️');
                return;
            }

            localStorage.setItem('usuario_rol', tipo.value);
            localStorage.setItem('usuario_nombre', nombre.value.trim());

            mostrarToast('Cuenta creada con éxito', '✅');
            setTimeout(() => { window.location.href = 'index.html'; }, 1500);
        });
    }


    if (window.location.pathname.includes('contacto.html')) {
        formulario.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombre = document.querySelector('#nombre');
            const correo = document.querySelector('#correo');
            const mensaje = document.querySelector('#mensaje');
            let hayError = false;

            [nombre, correo, mensaje].forEach(c => {
                if (!c.value.trim()) {
                    c.classList.add('campo-error');
                    hayError = true;
                } else {
                    c.classList.remove('campo-error');
                }
            });

            const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (correo.value.trim() && !regexCorreo.test(correo.value.trim())) {
                correo.classList.add('campo-error');
                mostrarToast('Ingresa un correo válido', '⚠️');
                return;
            }

            if (hayError) {
                mostrarToast('Por favor completa todos los campos', '⚠️');
                return;
            }

            mostrarToast('Mensaje enviado. Te responderemos a la brevedad', '✉️');
            formulario.reset();
        });
    }
});