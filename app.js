document.addEventListener('DOMContentLoaded', () => {
    const crearTarjetaBtn = document.getElementById('crear-tarjeta');
    const verTarjetasBtn = document.getElementById('ver-tarjetas');
    const formularioTarjeta = document.getElementById('formulario-tarjeta');
    const tarjetasList = document.getElementById('tarjetas-list');
    const cancelarFormulario = document.getElementById('cancelar-formulario');
    const formTarjeta = document.getElementById('form-tarjeta');

    // Acción para crear tarjeta
    crearTarjetaBtn.addEventListener('click', () => {
        // Mostrar el formulario de creación
        formularioTarjeta.classList.remove('oculto');
        tarjetasList.classList.add('oculto');

        // Resetear el formulario a modo creación
        document.getElementById('formulario-tarjeta').querySelector('h2').textContent = "Crear Tarjeta";
        const botonGuardar = document.getElementById('form-tarjeta').querySelector('button[type="submit"]');
        botonGuardar.textContent = "Guardar";

        // Limpiar los campos del formulario
        document.getElementById('nombre-tarjeta').value = '';
        document.getElementById('monto-inicial').value = '';
    });

    // Acción para ver tarjetas
    verTarjetasBtn.addEventListener('click', () => {
        cargarTarjetas();
        tarjetasList.classList.remove('oculto');
        formularioTarjeta.classList.add('oculto');
    });

    cancelarFormulario.addEventListener('click', () => {
        formularioTarjeta.classList.add('oculto');
    });

    formTarjeta.addEventListener('submit', (e) => {
        e.preventDefault();

        const nombre = document.getElementById('nombre-tarjeta').value;
        const montoInicial = parseFloat(document.getElementById('monto-inicial').value);
        const fechaCreacion = new Date().toISOString().split('T')[0];

        const tarjetas = JSON.parse(localStorage.getItem('tarjetas')) || [];
        const nuevaTarjeta = {
            id: Date.now().toString(),
            nombre,
            fechaCreacion,
            montoInicial,
            saldoDisponible: montoInicial,
            movimientos: [],
        };

        tarjetas.push(nuevaTarjeta);
        localStorage.setItem('tarjetas', JSON.stringify(tarjetas));
        formularioTarjeta.classList.add('oculto');
        cargarTarjetas();
    });
});

// Función para cargar las tarjetas
function cargarTarjetas() {
    const tarjetas = JSON.parse(localStorage.getItem('tarjetas')) || [];
    const tarjetasList = document.getElementById('tarjetas-list');
    
    // Limpiar la lista de tarjetas cada vez que cargamos
    tarjetasList.innerHTML = '';

    // Verificar si hay tarjetas almacenadas
    if (tarjetas.length === 0) {
        tarjetasList.innerHTML = '<p>No tienes tarjetas creadas aún.</p>';
        return;
    }

    // Crear una tarjeta en el HTML por cada tarjeta almacenada
    tarjetas.forEach(tarjeta => {
        const tarjetaDiv = document.createElement('div');
        tarjetaDiv.classList.add('tarjeta');
        tarjetaDiv.innerHTML = `
            <h3>${tarjeta.nombre}</h3>
            <p><strong>Saldo disponible:</strong> $${tarjeta.saldoDisponible}</p>
            <button class="editar" onclick="editarTarjeta(event, '${tarjeta.id}')">Editar</button>
            <button class="eliminar" onclick="eliminarTarjeta('${tarjeta.id}')">Eliminar</button>
        `;
        
        // Agregar la tarjeta al contenedor
        tarjetasList.appendChild(tarjetaDiv);
    });
}

// Función para eliminar una tarjeta
function eliminarTarjeta(id) {
    let tarjetas = JSON.parse(localStorage.getItem('tarjetas')) || [];
    tarjetas = tarjetas.filter(tarjeta => tarjeta.id !== id); // Filtrar la tarjeta que no coincide con el id
    localStorage.setItem('tarjetas', JSON.stringify(tarjetas)); // Guardar de nuevo en localStorage
    cargarTarjetas(); // Volver a cargar las tarjetas actualizadas
}

// Función para editar una tarjeta
function editarTarjeta(event, id) {
    event.stopPropagation(); // Evitar que se ejecute el clic en el contenedor

    const tarjetas = JSON.parse(localStorage.getItem('tarjetas')) || [];
    const tarjetaEditar = tarjetas.find(tarjeta => tarjeta.id === id);  // Encontrar la tarjeta a editar

    // Rellenar el formulario con los datos de la tarjeta seleccionada
    document.getElementById('nombre-tarjeta').value = tarjetaEditar.nombre;
    document.getElementById('monto-inicial').value = tarjetaEditar.saldoDisponible;
    
    // Cambiar el texto del título y el botón para reflejar que estamos en modo edición
    document.getElementById('formulario-tarjeta').querySelector('h2').textContent = "Editar Tarjeta";
    const botonGuardar = document.getElementById('form-tarjeta').querySelector('button[type="submit"]');
    botonGuardar.textContent = "Actualizar";

    // Mostrar el formulario
    document.getElementById('formulario-tarjeta').classList.remove('oculto');
    document.getElementById('tarjetas-list').classList.add('oculto');

    // Actualizar tarjeta en localStorage al enviar el formulario
    const formTarjeta = document.getElementById('form-tarjeta');
    formTarjeta.onsubmit = function(e) {
        e.preventDefault();
        const nuevoNombre = document.getElementById('nombre-tarjeta').value;
        const nuevoMonto = parseFloat(document.getElementById('monto-inicial').value);

        // Validar datos
        if (!nuevoNombre.trim() || isNaN(nuevoMonto) || nuevoMonto <= 0) {
            alert('Por favor ingresa un nombre válido y un monto mayor que cero.');
            return;
        }

        // Actualizar los datos de la tarjeta
        tarjetaEditar.nombre = nuevoNombre;
        tarjetaEditar.saldoDisponible = nuevoMonto;
        tarjetaEditar.montoInicial = nuevoMonto;  // Actualizar el monto inicial también

        // Guardar los cambios en localStorage
        localStorage.setItem('tarjetas', JSON.stringify(tarjetas));

        // Volver a cargar las tarjetas y cerrar el formulario
        cargarTarjetas();
        document.getElementById('formulario-tarjeta').classList.add('oculto');
        document.getElementById('tarjetas-list').classList.remove('oculto');
    };
}
