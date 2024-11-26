// Contadores para IDs únicos
let unidadBomberosCounter = 0;
let unidadCarabinerosCounter = 0;
let unidadAmbulanciaCounter = 0;

// Constantes
const CODIGOS_BOMBEROS = {
    unidadesCompania: [
        'B',    // Carro Bomba/Carro de Agua
        'BX',   // Carro Bomba Apoyo
        'Q',    // Carro Portaescalas y Salvamento
        'M',    // Escala Telescópica
        'MX',   // Brazo Articulado
        'R',    // Carro de Rescate Vehicular
        'RX',   // Carro de Rescate Vehicular Pesado
        'RB',   // Carro de Rescate Vehicular Apoyo Agua
        'RH',   // Carro de Rescate Urbano
        'H',    // Carro Hazmat
        'X',    // Puesto de Mando y Comunicaciones
        'Z',    // Carro Cisterna
        'UT',   // Unidad Técnica de apoyo
        'BR',   // Carro bomba y rescate de reemplazo
        'QR'    // Carro portaescalas de reemplazo
    ],
    unidadesCuerpo: [
        'K',    // Camioneta de Comandancia
        'S'     // Ambulancia del Cuerpo
    ]
};

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('agregarUnidadBomberos')?.addEventListener('click', () => agregarUnidad('bomberos'));
    document.getElementById('agregarUnidadCarabineros')?.addEventListener('click', () => agregarUnidad('carabineros'));
    document.getElementById('agregarUnidadAmbulancia')?.addEventListener('click', () => agregarUnidad('ambulancia'));
});

// Función genérica para agregar unidades
function agregarUnidad(tipo) {
    const configs = {
        bomberos: {
            contador: unidadBomberosCounter++,
            lista: 'listaUnidadesBomberos',
            template: crearTemplateBomberos
        },
        carabineros: {
            contador: unidadCarabinerosCounter++,
            lista: 'listaUnidadesCarabineros',
            template: crearTemplateCarabineros
        },
        ambulancia: {
            contador: unidadAmbulanciaCounter++,
            lista: 'listaUnidadesAmbulancia',
            template: crearTemplateAmbulancia
        }
    };

    const config = configs[tipo];
    if (!config) return;

    const listaUnidades = document.getElementById(config.lista);
    const unidadId = `unidad${tipo.charAt(0).toUpperCase() + tipo.slice(1)}_${config.contador}`;
    
    const unidadHTML = config.template(unidadId);
    listaUnidades.insertAdjacentHTML('beforeend', unidadHTML);
    
    const nuevaUnidad = document.getElementById(unidadId);
    nuevaUnidad.style.opacity = '0';
    nuevaUnidad.style.transform = 'translateY(-20px)';
    
    requestAnimationFrame(() => {
        nuevaUnidad.style.opacity = '1';
        nuevaUnidad.style.transform = 'translateY(0)';
        nuevaUnidad.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
    
    inicializarValidaciones(unidadId, tipo);
    actualizarDatosUnidades();
}

// Templates para cada tipo de unidad
function crearTemplateBomberos(id) {
    return `
        <div class="lista-item unidad-item" id="${id}">
            <button type="button" class="btn-icon eliminar" onclick="eliminarUnidad('${id}', 'bomberos')">
                <span class="icon-close"></span>
            </button>
            
            <div class="form-group">
                <label for="${id}_codigo">Código de Unidad:</label>
                <div class="input-with-tooltip">
                    <input type="text" 
                           id="${id}_codigo"
                           class="codigo-bomberos" 
                           placeholder="Ej: B-6, RX-6"
                           required
                           data-field="codigo">
                    <div class="tooltip">
                        <span class="tooltip-text">
                            Formatos válidos:<br>
                            - Unidades de compañía: B-6, RX-6, etc.<br>
                            - Unidades del cuerpo: K-1, S-2, etc.
                        </span>
                    </div>
                </div>
                <span class="error-message" id="${id}_codigo_error"></span>
            </div>
        </div>
    `;
}

function crearTemplateCarabineros(id) {
    return `
        <div class="lista-item unidad-item" id="${id}">
            <button type="button" class="btn-icon eliminar" onclick="eliminarUnidad('${id}', 'carabineros')">
                <span class="icon-close"></span>
            </button>
            
            <div class="grid-2">
                <div class="form-group">
                    <label for="${id}_codigo">Código de Unidad:</label>
                    <input type="text" 
                           id="${id}_codigo" 
                           placeholder="Ej: Z-105"
                           required
                           data-field="codigo">
                    <span class="error-message" id="${id}_codigo_error"></span>
                </div>

                <div class="form-group">
                    <label for="${id}_comisaria">Comisaría:</label>
                    <input type="text" 
                           id="${id}_comisaria" 
                           placeholder="Nombre de la comisaría"
                           required
                           data-field="comisaria">
                    <span class="error-message" id="${id}_comisaria_error"></span>
                </div>
            </div>
        </div>
    `;
}
function crearTemplateAmbulancia(id) {
    return `
        <div class="lista-item unidad-item" id="${id}">
            <button type="button" class="btn-icon eliminar" onclick="eliminarUnidad('${id}', 'ambulancia')">
                <span class="icon-close"></span>
            </button>
            
            <div class="grid-2">
                <div class="form-group">
                    <label for="${id}_codigo">Código de Unidad:</label>
                    <input type="text" 
                           id="${id}_codigo" 
                           placeholder="Ej: SAMU-6"
                           required
                           data-field="codigo">
                    <span class="error-message" id="${id}_codigo_error"></span>
                </div>

                <div class="form-group">
                    <label for="${id}_encargado">Persona a Cargo:</label>
                    <input type="text" 
                           id="${id}_encargado" 
                           placeholder="Nombre del encargado"
                           required
                           data-field="encargado">
                    <span class="error-message" id="${id}_encargado_error"></span>
                </div>
            </div>

            <div class="grid-2">
                <div class="form-group">
                    <label for="${id}_cargo">Cargo:</label>
                    <input type="text" 
                           id="${id}_cargo" 
                           placeholder="Cargo del encargado"
                           required
                           data-field="cargo">
                    <span class="error-message" id="${id}_cargo_error"></span>
                </div>

                <div class="form-group">
                    <label for="${id}_base">Base:</label>
                    <input type="text" 
                           id="${id}_base" 
                           placeholder="Base de operaciones"
                           required
                           data-field="base">
                    <span class="error-message" id="${id}_base_error"></span>
                </div>
            </div>
        </div>
    `;
}

// Inicializar validaciones según tipo de unidad
function inicializarValidaciones(unidadId, tipo) {
    const elemento = document.getElementById(unidadId);
    if (!elemento) return;

    switch (tipo) {
        case 'bomberos':
            const codigoInput = document.getElementById(`${unidadId}_codigo`);
            if (codigoInput) {
                codigoInput.addEventListener('input', (e) => validarCodigoBomberos(e.target));
                codigoInput.addEventListener('blur', (e) => validarCodigoBomberos(e.target, true));
            }
            break;
            
        case 'carabineros':
            const codigoCarabineros = document.getElementById(`${unidadId}_codigo`);
            if (codigoCarabineros) {
                codigoCarabineros.addEventListener('input', (e) => validarCodigoCarabineros(e.target));
            }
            break;
            
        case 'ambulancia':
            const codigoAmbulancia = document.getElementById(`${unidadId}_codigo`);
            if (codigoAmbulancia) {
                codigoAmbulancia.addEventListener('input', (e) => validarCodigoAmbulancia(e.target));
            }
            break;
    }

    elemento.addEventListener('input', actualizarDatosUnidades);
    elemento.addEventListener('change', actualizarDatosUnidades);
}

// Validación de código de bomberos
function validarCodigoBomberos(input, mostrarError = false) {
    const valor = input.value.toUpperCase();
    input.value = valor;
    const errorSpan = document.getElementById(`${input.id}_error`);
    
    let isValid = false;
    let mensaje = '';

    const [codigo, numero] = valor.split('-');

    if (CODIGOS_BOMBEROS.unidadesCompania.includes(codigo)) {
        isValid = /^[1-8]$/.test(numero);
        mensaje = 'Formato inválido. Ejemplo: B-6 o RX-6';
    } else if (CODIGOS_BOMBEROS.unidadesCuerpo.includes(codigo)) {
        isValid = /^\d+$/.test(numero);
        mensaje = 'Formato inválido. Ejemplo: K-1 o S-2';
    } else {
        mensaje = 'Código de unidad no reconocido';
    }

    if (mostrarError || !isValid) {
        errorSpan.textContent = !isValid ? mensaje : '';
        input.classList.toggle('field-error', !isValid);
    }

    input.setCustomValidity(isValid ? '' : mensaje);
    return isValid;
}

// Validación de código de carabineros
function validarCodigoCarabineros(input) {
    const valor = input.value.trim();
    const errorSpan = document.getElementById(`${input.id}_error`);
    
    const isValid = /^[A-Z]-\d+$/.test(valor);
    const mensaje = isValid ? '' : 'Formato inválido. Ejemplo: Z-105';

    errorSpan.textContent = mensaje;
    input.classList.toggle('field-error', !isValid);
    input.setCustomValidity(mensaje);
    
    return isValid;
}

// Validación de código de ambulancia
function validarCodigoAmbulancia(input) {
    const valor = input.value.trim();
    const errorSpan = document.getElementById(`${input.id}_error`);
    
    const isValid = /^SAMU-\d+$/.test(valor);
    const mensaje = isValid ? '' : 'Formato inválido. Ejemplo: SAMU-6';

    errorSpan.textContent = mensaje;
    input.classList.toggle('field-error', !isValid);
    input.setCustomValidity(mensaje);
    
    return isValid;
}

// Función para eliminar unidad
function eliminarUnidad(unidadId, tipo) {
    const confirmacion = confirm('¿Está seguro de eliminar esta unidad?');
    if (confirmacion) {
        const unidad = document.getElementById(unidadId);
        
        unidad.style.opacity = '0';
        unidad.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            unidad.remove();
            actualizarDatosUnidades();
        }, 300);
    }
}

// Actualización de datos de unidades
function actualizarDatosUnidades() {
    // Actualizar unidades de bomberos
    const unidadesBomberos = Array.from(document.querySelectorAll('#listaUnidadesBomberos .lista-item'))
        .map(item => ({
            codigo: document.getElementById(`${item.id}_codigo`)?.value?.trim().toUpperCase() || ''
        }))
        .filter(unidad => unidad.codigo && validarCodigoBomberos(document.getElementById(`${item.id}_codigo`)));

    // Actualizar unidades de carabineros
    const unidadesCarabineros = Array.from(document.querySelectorAll('#listaUnidadesCarabineros .lista-item'))
        .map(item => ({
            codigo: document.getElementById(`${item.id}_codigo`)?.value?.trim() || '',
            comisaria: document.getElementById(`${item.id}_comisaria`)?.value?.trim() || ''
        }))
        .filter(unidad => unidad.codigo && unidad.comisaria);

    // Actualizar unidades de ambulancia
    const unidadesAmbulancia = Array.from(document.querySelectorAll('#listaUnidadesAmbulancia .lista-item'))
        .map(item => ({
            codigo: document.getElementById(`${item.id}_codigo`)?.value?.trim() || '',
            encargado: document.getElementById(`${item.id}_encargado`)?.value?.trim() || '',
            cargo: document.getElementById(`${item.id}_cargo`)?.value?.trim() || '',
            base: document.getElementById(`${item.id}_base`)?.value?.trim() || ''
        }))
        .filter(unidad => unidad.codigo && unidad.encargado && unidad.cargo && unidad.base);

    // Actualizar el estado global
    window.StateManager.updateData('unidadesBomberos', unidadesBomberos);
    window.StateManager.updateData('unidadesCarabineros', unidadesCarabineros);
    window.StateManager.updateData('unidadesAmbulancia', unidadesAmbulancia);
}

// Exportar funciones necesarias
window.eliminarUnidad = eliminarUnidad;
window.validarCodigoBomberos = validarCodigoBomberos;
window.validarCodigoCarabineros = validarCodigoCarabineros;
window.validarCodigoAmbulancia = validarCodigoAmbulancia;