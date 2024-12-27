document.addEventListener('DOMContentLoaded', cargarDetallesTarjeta);

function cargarDetallesTarjeta() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const tarjetas = JSON.parse(localStorage.getItem('tarjetas')) || [];
    const tarjeta = tarjetas.find(t => t.id === id);

    if (tarjeta) {
        document.getElementById('nombre-tarjeta-detalle').innerText = tarjeta.nombre;
        document.getElementById('fecha-creacion').innerText = tarjeta.fechaCreacion;
        document.getElementById('saldo-disponible').innerText = `Lps ${tarjeta.saldoDisponible.toFixed(2)}`;

        const movimientosList = document.getElementById('movimientos-list');
        movimientosList.innerHTML = '';

        tarjeta.movimientos.forEach(movimiento => {
            const movimientoElement = document.createElement('li');
            movimientoElement.classList.add(
                movimiento.tipoMovimiento === 'entrada' ? 'ingreso' : 'egreso'
            );
            movimientoElement.innerHTML = `
                <p>${movimiento.nombreMovimiento} - ${movimiento.fechaMovimiento} - Lps ${movimiento.valorMovimiento.toFixed(2)}</p>
                <button onclick="eliminarMovimiento('${tarjeta.id}', '${movimiento.id}')">Eliminar</button>
            `;
            movimientosList.appendChild(movimientoElement);
        });
    } else {
        alert("No se encontró la tarjeta.");
    }
}

document.getElementById('agregar-movimiento').addEventListener('click', () => {
    document.getElementById('formulario-movimiento').classList.remove('oculto');
});

document.getElementById('cancelar-formulario-movimiento').addEventListener('click', () => {
    document.getElementById('formulario-movimiento').classList.add('oculto');
});

document.getElementById('form-movimiento').addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre-movimiento').value;
    const fecha = document.getElementById('fecha-movimiento').value;
    const valor = parseFloat(document.getElementById('valor-movimiento').value);
    const tipoMovimiento = document.getElementById('tipo-movimiento').value;
    const mensajeError = document.getElementById('mensaje-error');

    const tarjetaId = new URLSearchParams(window.location.search).get('id');
    const tarjetas = JSON.parse(localStorage.getItem('tarjetas')) || [];
    const tarjeta = tarjetas.find(t => t.id === tarjetaId);

    // Validar datos
    if (!nombre || !fecha || isNaN(valor)) {
        mensajeError.textContent = "Por favor, complete todos los campos correctamente.";
        mensajeError.classList.remove('oculto');
        return;
    }

    if (tarjeta) {
        // Validar saldo para salidas
        if (tipoMovimiento === 'salida' && tarjeta.saldoDisponible < valor) {
            mensajeError.textContent = "Saldo insuficiente para realizar esta operación.";
            mensajeError.classList.remove('oculto');
            return;
        }

        // Ajustar el saldo según el tipo de movimiento
        mensajeError.classList.add('oculto'); // Oculta el mensaje si todo está bien
        if (tipoMovimiento === 'entrada') {
            tarjeta.saldoDisponible += valor;
        } else if (tipoMovimiento === 'salida') {
            tarjeta.saldoDisponible -= valor;
        }

        // Crear el movimiento
        tarjeta.movimientos.push({
            id: Date.now().toString(),
            nombreMovimiento: nombre,
            fechaMovimiento: fecha,
            valorMovimiento: valor,
        });

        // Guardar cambios en localStorage
        localStorage.setItem('tarjetas', JSON.stringify(tarjetas));
        cargarDetallesTarjeta();

        // Ocultar formulario
        document.getElementById('formulario-movimiento').classList.add('oculto');
    } else {
        mensajeError.textContent = "No se encontró la tarjeta.";
        mensajeError.classList.remove('oculto');
    }
});


/*function eliminarMovimiento(tarjetaId, movimientoId) {
    const tarjetas = JSON.parse(localStorage.getItem('tarjetas')) || [];
    const tarjeta = tarjetas.find(t => t.id === tarjetaId);

    if (tarjeta) {
        const movimientoIndex = tarjeta.movimientos.findIndex(mov => mov.id === movimientoId);
        if (movimientoIndex !== -1) {
            const movimiento = tarjeta.movimientos[movimientoIndex];

            // Ajustar el saldo según el tipo de movimiento
            if (movimiento.tipoMovimiento === 'entrada') {
                // Si es un ingreso (entrada), restamos del saldo
                tarjeta.saldoDisponible -= movimiento.valorMovimiento;
            } else if (movimiento.tipoMovimiento === 'salida') {
                // Si es un egreso (salida), sumamos el valor absoluto del egreso
                tarjeta.saldoDisponible += Math.abs(movimiento.valorMovimiento);
            }

            // Eliminar el movimiento
            tarjeta.movimientos.splice(movimientoIndex, 1);

            // Guardar los cambios en localStorage
            localStorage.setItem('tarjetas', JSON.stringify(tarjetas));

            // Recargar los detalles de la tarjeta para reflejar los cambios
            cargarDetallesTarjeta();
        }
    }
}*/

function eliminarMovimiento(tarjetaId, movimientoId) {
    const tarjetas = JSON.parse(localStorage.getItem('tarjetas')) || [];
    const tarjeta = tarjetas.find(t => t.id === tarjetaId);

    if (tarjeta) {
        const movimientoIndex = tarjeta.movimientos.findIndex(mov => mov.id === movimientoId);
        if (movimientoIndex !== -1) {
            const movimiento = tarjeta.movimientos[movimientoIndex];

            // Ajustar el saldo según el tipo de movimiento
            if (movimiento.valorMovimiento > 0) {
                // Si es un ingreso (entrada), restamos del saldo
                tarjeta.saldoDisponible -= movimiento.valorMovimiento;
            } else {
                // Si es un egreso (salida), sumamos el valor absoluto del egreso
                tarjeta.saldoDisponible -= movimiento.valorMovimiento;
            }

            // Eliminar el movimiento
            tarjeta.movimientos.splice(movimientoIndex, 1);

            // Verificar si el saldo no es negativo
            if (tarjeta.saldoDisponible < 0) {
                // Si el saldo es negativo, revertir el cambio
                alert("El saldo no puede ser negativo. No se eliminó el movimiento.");
                tarjeta.saldoDisponible += movimiento.valorMovimiento; // Revertir el ajuste
                return;
            }

            // Guardar los cambios en localStorage
            localStorage.setItem('tarjetas', JSON.stringify(tarjetas));

            // Recargar los detalles de la tarjeta para reflejar los cambios
            cargarDetallesTarjeta();
        }
    }
}
