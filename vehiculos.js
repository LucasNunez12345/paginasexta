// Contador para IDs únicos de vehículos
let vehiculoCounter = 0;

// Constantes
const TIPOS_VEHICULO = {
    automovil: {
        nombre: 'Automóvil',
        requierePatente: true,
        patenteFormato: 'auto'
    },
    dos_ruedas: {
        nombre: 'Vehículo de dos ruedas',
        requierePatente: true,
        patenteFormato: 'moto'
    },
    tres_ruedas: {
        nombre: 'Vehículo de tres ruedas',
        requierePatente: true,
        patenteFormato: 'auto'
    },
    traccion_animal: {
        nombre: 'Vehículo de tracción animal',
        requierePatente: false
    },
    transporte_personas: {
        nombre: 'Transporte de personas',
        requierePatente: true,
        patenteFormato: 'auto'
    },
    transporte_carga: {
        nombre: 'Transporte de carga',
        requierePatente: true,
        patenteFormato: 'auto'
    },
    agricola: {
        nombre: 'Vehículo agrícola',
        requierePatente: true,
        patenteFormato: 'auto'
    },
    bicicleta: {
        nombre: 'Bicicleta',
        requierePatente: false
    }
};

const PATENTE_FORMATOS = {
    auto: {
        patron: /^([A-Z]{4}\d{2}|[A-Z]{2}\d{4})$/,
        ejemplo: 'BBBB99 o BB9999',
        descripcion: 'Formato antiguo: BBBB99, Formato nuevo: BB9999'
    },
    moto: {
        patron: /^([A-Z]{2}\d{2}[A-Z]{2}|[A-Z]{2}\d{3})$/,
        ejemplo: 'BK17GJ o OT784',
        descripcion: 'Formato antiguo: OT784, Formato nuevo: BK17GJ'
    }
};

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
    const btnAgregarVehiculo = document.getElementById('agregarVehiculo');
    if (btnAgregarVehiculo) {
        btnAgregarVehiculo.addEventListener('click', agregarVehiculo);
    }
});

// Función para agregar un nuevo vehículo
function agregarVehiculo() {
    const listaVehiculos = document.getElementById('listaVehiculos');
    const vehiculoId = `vehiculo_${vehiculoCounter++}`;
    
    const vehiculoHTML = crearTemplateVehiculo(vehiculoId);
    listaVehiculos.insertAdjacentHTML('beforeend', vehiculoHTML);
    
    const nuevoVehiculo = document.getElementById(vehiculoId);
    nuevoVehiculo.style.opacity = '0';
    nuevoVehiculo.style.transform = 'translateY(-20px)';
    
    requestAnimationFrame(() => {
        nuevoVehiculo.style.opacity = '1';
        nuevoVehiculo.style.transform = 'translateY(0)';
        nuevoVehiculo.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
    
    initializeVehiculoValidation(vehiculoId);
    actualizarDatosVehiculos();
}

// Template para nuevo vehículo
function crearTemplateVehiculo(vehiculoId) {
    return `
        <div class="lista-item vehiculo-item" id="${vehiculoId}">
            <button type="button" class="btn-icon eliminar" onclick="eliminarVehiculo('${vehiculoId}')">
                <span class="icon-close"></span>
            </button>
            
            <div class="grid-2">
                <div class="form-group">
                    <label for="${vehiculoId}_tipo">Tipo de Vehículo:</label>
                    <select id="${vehiculoId}_tipo" required data-field="tipo">
                        <option value="">Seleccione tipo</option>
                        ${Object.entries(TIPOS_VEHICULO).map(([value, tipo]) => 
                            `<option value="${value}">${tipo.nombre}</option>`
                        ).join('')}
                    </select>
                    <span class="error-message" id="${vehiculoId}_tipo_error"></span>
                </div>

                <div class="form-group" id="${vehiculoId}_grupo_matricula">
                    <label for="${vehiculoId}_matricula">Matrícula:</label>
                    <div class="input-with-tooltip">
                        <input type="text" 
                               id="${vehiculoId}_matricula"
                               data-field="matricula"
                               disabled
                               placeholder="Seleccione primero el tipo de vehículo">
                        <div class="tooltip">
                            <span class="tooltip-text" id="${vehiculoId}_matricula_tooltip">
                                Seleccione el tipo de vehículo para ver el formato
                            </span>
                        </div>
                    </div>
                    <span class="error-message" id="${vehiculoId}_matricula_error"></span>
                </div>
            </div>

            <div class="grid-3">
                <div class="form-group">
                    <label for="${vehiculoId}_marca">Marca:</label>
                    <input type="text" 
                           id="${vehiculoId}_marca" 
                           required 
                           data-field="marca">
                    <span class="error-message" id="${vehiculoId}_marca_error"></span>
                </div>

                <div class="form-group">
                    <label for="${vehiculoId}_modelo">Modelo:</label>
                    <input type="text" 
                           id="${vehiculoId}_modelo" 
                           required 
                           data-field="modelo">
                    <span class="error-message" id="${vehiculoId}_modelo_error"></span>
                </div>

                <div class="form-group">
                    <label for="${vehiculoId}_anio">Año:</label>
                    <div class="input-with-tooltip">
                        <input type="number" 
                               id="${vehiculoId}_anio" 
                               min="1900" 
                               max="${new Date().getFullYear() + 1}"
                               required 
                               data-field="anio">
                        <div class="tooltip">
                            <span class="tooltip-text">
                                Año entre 1900 y ${new Date().getFullYear() + 1}
                            </span>
                        </div>
                    </div>
                    <span class="error-message" id="${vehiculoId}_anio_error"></span>
                </div>
            </div>
        </div>
    `;
}
// Inicializar validaciones para un vehículo
function initializeVehiculoValidation(vehiculoId) {
    // Manejo del tipo de vehículo
    const tipoSelect = document.getElementById(`${vehiculoId}_tipo`);
    if (tipoSelect) {
        tipoSelect.addEventListener('change', () => {
            actualizarCampoMatricula(vehiculoId);
            actualizarDatosVehiculos();
        });
    }

    // Validación de matrícula
    const matriculaInput = document.getElementById(`${vehiculoId}_matricula`);
    if (matriculaInput) {
        matriculaInput.addEventListener('input', (e) => validarMatricula(e.target));
        matriculaInput.addEventListener('blur', (e) => validarMatricula(e.target, true));
    }

    // Validación de año
    const anioInput = document.getElementById(`${vehiculoId}_anio`);
    if (anioInput) {
        anioInput.addEventListener('input', (e) => validarAnio(e.target));
        anioInput.addEventListener('blur', (e) => validarAnio(e.target, true));
    }

    // Listener para actualización automática
    const vehiculoElement = document.getElementById(vehiculoId);
    if (vehiculoElement) {
        vehiculoElement.addEventListener('input', actualizarDatosVehiculos);
        vehiculoElement.addEventListener('change', actualizarDatosVehiculos);
    }
}

// Actualizar campo de matrícula según tipo de vehículo
function actualizarCampoMatricula(vehiculoId) {
    const tipoSelect = document.getElementById(`${vehiculoId}_tipo`);
    const matriculaInput = document.getElementById(`${vehiculoId}_matricula`);
    const matriculaTooltip = document.getElementById(`${vehiculoId}_matricula_tooltip`);
    const grupoMatricula = document.getElementById(`${vehiculoId}_grupo_matricula`);
    
    const tipoVehiculo = TIPOS_VEHICULO[tipoSelect.value];
    
    if (tipoVehiculo) {
        if (tipoVehiculo.requierePatente) {
            const formato = PATENTE_FORMATOS[tipoVehiculo.patenteFormato];
            matriculaInput.disabled = false;
            matriculaInput.required = true;
            matriculaInput.placeholder = formato.ejemplo;
            matriculaTooltip.textContent = formato.descripcion;
            grupoMatricula.style.display = 'block';
            
            requestAnimationFrame(() => {
                grupoMatricula.classList.add('campo-condicional', 'active');
            });
        } else {
            grupoMatricula.classList.remove('active');
            setTimeout(() => {
                matriculaInput.disabled = true;
                matriculaInput.required = false;
                matriculaInput.value = '';
                matriculaInput.placeholder = 'No requiere matrícula';
                grupoMatricula.style.display = 'none';
            }, 300);
        }
    } else {
        matriculaInput.disabled = true;
        matriculaInput.required = false;
        matriculaInput.placeholder = 'Seleccione primero el tipo de vehículo';
        grupoMatricula.style.display = 'none';
    }
}

// Validación de matrícula
function validarMatricula(input, mostrarError = false) {
    const vehiculoId = input.id.split('_')[0];
    const tipoSelect = document.getElementById(`${vehiculoId}_tipo`);
    const tipoVehiculo = TIPOS_VEHICULO[tipoSelect.value];
    
    if (!tipoVehiculo || !tipoVehiculo.requierePatente) {
        return true;
    }

    const valor = input.value.trim().toUpperCase();
    input.value = valor;
    
    const errorSpan = document.getElementById(`${input.id}_error`);
    const formato = PATENTE_FORMATOS[tipoVehiculo.patenteFormato];
    
    let isValid = true;
    let mensaje = '';

    if (valor) {
        if (!formato.patron.test(valor)) {
            isValid = false;
            mensaje = `Formato inválido. Use: ${formato.ejemplo}`;
        }
    }

    if (mostrarError || !isValid) {
        errorSpan.textContent = mensaje;
        input.classList.toggle('field-error', !isValid);
    }

    input.setCustomValidity(isValid ? '' : mensaje);
    return isValid;
}

// Validación de año
function validarAnio(input, mostrarError = false) {
    const valor = parseInt(input.value);
    const errorSpan = document.getElementById(`${input.id}_error`);
    const anioActual = new Date().getFullYear();
    
    let isValid = true;
    let mensaje = '';

    if (isNaN(valor)) {
        isValid = false;
        mensaje = 'Ingrese un año válido';
    } else if (valor < 1900 || valor > anioActual + 1) {
        isValid = false;
        mensaje = `El año debe estar entre 1900 y ${anioActual + 1}`;
    }

    if (mostrarError || !isValid) {
        errorSpan.textContent = mensaje;
        input.classList.toggle('field-error', !isValid);
    }

    input.setCustomValidity(isValid ? '' : mensaje);
    return isValid;
}

// Función para eliminar vehículo
function eliminarVehiculo(vehiculoId) {
    const confirmacion = confirm('¿Está seguro de eliminar este vehículo?');
    if (confirmacion) {
        const vehiculo = document.getElementById(vehiculoId);
        
        vehiculo.style.opacity = '0';
        vehiculo.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            vehiculo.remove();
            actualizarDatosVehiculos();
        }, 300);
    }
}

// Actualización de datos
function actualizarDatosVehiculos() {
    const vehiculos = [];
    
    document.querySelectorAll('#listaVehiculos .lista-item').forEach(item => {
        const vehiculoId = item.id;
        const tipo = document.getElementById(`${vehiculoId}_tipo`)?.value;
        
        if (tipo) {
            const vehiculo = {
                tipo,
                matricula: document.getElementById(`${vehiculoId}_matricula`)?.value?.trim() || '',
                marca: document.getElementById(`${vehiculoId}_marca`)?.value?.trim() || '',
                modelo: document.getElementById(`${vehiculoId}_modelo`)?.value?.trim() || '',
                anio: parseInt(document.getElementById(`${vehiculoId}_anio`)?.value) || 0
            };

            if (!TIPOS_VEHICULO[tipo].requierePatente) {
                vehiculo.matricula = '-';
            }

            if (validarDatosVehiculo(vehiculo, vehiculoId)) {
                vehiculos.push(vehiculo);
            }
        }
    });

    window.StateManager.updateData('vehiculos', vehiculos);
}

// Validación de datos del vehículo
function validarDatosVehiculo(vehiculo, vehiculoId) {
    let isValid = true;
    const tipoVehiculo = TIPOS_VEHICULO[vehiculo.tipo];

    if (!tipoVehiculo) {
        mostrarErrorCampo(`${vehiculoId}_tipo`, 'Tipo de vehículo inválido');
        isValid = false;
    }

    if (tipoVehiculo?.requierePatente) {
        const matriculaInput = document.getElementById(`${vehiculoId}_matricula`);
        if (!validarMatricula(matriculaInput, true)) {
            isValid = false;
        }
    }

    const anioInput = document.getElementById(`${vehiculoId}_anio`);
    if (!validarAnio(anioInput, true)) {
        isValid = false;
    }

    ['marca', 'modelo'].forEach(campo => {
        const input = document.getElementById(`${vehiculoId}_${campo}`);
        if (!vehiculo[campo]) {
            mostrarErrorCampo(input.id, 'Este campo es requerido');
            isValid = false;
        }
    });

    return isValid;
}

// Función auxiliar para mostrar errores
function mostrarErrorCampo(elementId, mensaje) {
    const elemento = document.getElementById(elementId);
    if (elemento) {
        elemento.classList.add('field-error');
        const errorSpan = document.getElementById(`${elementId}_error`);
        if (errorSpan) {
            errorSpan.textContent = mensaje;
        }
    }
}

// Exportar funciones necesarias
window.eliminarVehiculo = eliminarVehiculo;
window.validarMatricula = validarMatricula;
window.validarAnio = validarAnio;