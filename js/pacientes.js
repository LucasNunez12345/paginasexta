// Contador para IDs únicos de pacientes
let pacienteCounter = 0;

// Constantes
const EDAD_MAXIMA = 120;
const CONDICIONES_MEDICAS = {
    sangramiento: {
        label: 'Sangramiento',
        placeholder: 'Indique la ubicación y gravedad'
    },
    dolor: {
        label: 'Dolor',
        placeholder: 'Describa ubicación e intensidad (1-10)'
    },
    lesionCervical: {
        label: 'Lesión Cervical',
        placeholder: 'Describa tipo y gravedad'
    },
    traumatismo: {
        label: 'Traumatismo',
        placeholder: 'Describa ubicación y tipo'
    }
};

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
    const btnAgregarPaciente = document.getElementById('agregarPaciente');
    if (btnAgregarPaciente) {
        btnAgregarPaciente.addEventListener('click', agregarPaciente);
    }
});

// Función para agregar un nuevo paciente
function agregarPaciente() {
    const listaPacientes = document.getElementById('listaPacientes');
    const pacienteId = `paciente_${pacienteCounter++}`;
    
    const pacienteHTML = crearTemplatePaciente(pacienteId);
    listaPacientes.insertAdjacentHTML('beforeend', pacienteHTML);
    
    const nuevoPaciente = document.getElementById(pacienteId);
    nuevoPaciente.style.opacity = '0';
    nuevoPaciente.style.transform = 'translateY(-20px)';
    
    requestAnimationFrame(() => {
        nuevoPaciente.style.opacity = '1';
        nuevoPaciente.style.transform = 'translateY(0)';
        nuevoPaciente.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
    
    inicializarCamposPaciente(pacienteId);
    actualizarDatosPacientes();
}

// Template para nuevo paciente
function crearTemplatePaciente(pacienteId) {
    return `
        <div class="lista-item paciente-item" id="${pacienteId}">
            <button type="button" class="btn-icon eliminar" onclick="eliminarPaciente('${pacienteId}')">
                <span class="icon-close"></span>
            </button>
            
            <div class="grid-2">
                <div class="form-group">
                    <label for="${pacienteId}_documento">Número de Documento:</label>
                    <div class="input-with-tooltip">
                        <input type="text" 
                               id="${pacienteId}_documento" 
                               pattern="\\d{8}-\\d{1}" 
                               placeholder="12345678-9" 
                               required
                               data-field="documento">
                        <div class="tooltip">
                            <span class="tooltip-text">Formato: 12345678-9</span>
                        </div>
                    </div>
                    <span class="error-message" id="${pacienteId}_documento_error"></span>
                </div>

                <div class="form-group">
                    <label for="${pacienteId}_nombre">Nombre Completo:</label>
                    <input type="text" 
                           id="${pacienteId}_nombre" 
                           required
                           data-field="nombre">
                    <span class="error-message" id="${pacienteId}_nombre_error"></span>
                </div>
            </div>

            <div class="grid-2">
                <div class="form-group">
                    <label for="${pacienteId}_edad">Edad:</label>
                    <div class="input-with-tooltip">
                        <input type="number" 
                               id="${pacienteId}_edad" 
                               min="0" 
                               max="${EDAD_MAXIMA}" 
                               required
                               data-field="edad">
                        <div class="tooltip">
                            <span class="tooltip-text">Edad: 0-${EDAD_MAXIMA} años</span>
                        </div>
                    </div>
                    <span class="error-message" id="${pacienteId}_edad_error"></span>
                </div>

                <div class="form-group">
                    <label>Género:</label>
                    <div class="radio-group">
                        <label class="radio-label">
                            <input type="radio" 
                                   name="${pacienteId}_genero" 
                                   value="masculino" 
                                   required
                                   data-field="genero">
                            <span>Masculino</span>
                        </label>
                        <label class="radio-label">
                            <input type="radio" 
                                   name="${pacienteId}_genero" 
                                   value="femenino"
                                   data-field="genero">
                            <span>Femenino</span>
                        </label>
                        <label class="radio-label">
                            <input type="radio" 
                                   name="${pacienteId}_genero" 
                                   value="otro"
                                   data-field="genero">
                            <span>Otro</span>
                        </label>
                    </div>
                    <span class="error-message" id="${pacienteId}_genero_error"></span>
                </div>
            </div>

            <div class="form-group">
                <label>Condiciones Médicas:</label>
                <div class="condiciones-grid">
                    ${Object.entries(CONDICIONES_MEDICAS).map(([key, condicion]) => 
                        crearCondicionMedica(pacienteId, key, condicion.label)
                    ).join('')}
                </div>
            </div>

            <div id="${pacienteId}_campos_adicionales" class="campos-adicionales">
                <!-- Se agregarán dinámicamente -->
            </div>
        </div>
    `;
}
// Función para crear el HTML de una condición médica
function crearCondicionMedica(pacienteId, nombre, label) {
    return `
        <div class="condicion-medica">
            <label class="checkbox-label">
                <input type="checkbox" 
                       id="${pacienteId}_${nombre}" 
                       onchange="toggleCampoAdicional('${pacienteId}', '${nombre}')"
                       data-field="${nombre}">
                <span class="checkbox-custom"></span>
                <span class="label-text">${label}</span>
            </label>
        </div>
    `;
}

// Inicialización de campos y validaciones
function inicializarCamposPaciente(pacienteId) {
    // Validación de documento
    const documentoInput = document.getElementById(`${pacienteId}_documento`);
    if (documentoInput) {
        documentoInput.addEventListener('input', (e) => validarDocumento(e.target));
        documentoInput.addEventListener('blur', (e) => validarDocumento(e.target, true));
    }

    // Validación de edad
    const edadInput = document.getElementById(`${pacienteId}_edad`);
    if (edadInput) {
        edadInput.addEventListener('input', (e) => validarEdad(e.target));
        edadInput.addEventListener('blur', (e) => validarEdad(e.target, true));
    }

    // Validación de género
    const generoInputs = document.getElementsByName(`${pacienteId}_genero`);
    generoInputs.forEach(input => {
        input.addEventListener('change', () => {
            const errorSpan = document.getElementById(`${pacienteId}_genero_error`);
            if (errorSpan) {
                errorSpan.textContent = '';
            }
        });
    });

    // Actualización automática
    const pacienteElement = document.getElementById(pacienteId);
    if (pacienteElement) {
        pacienteElement.addEventListener('input', actualizarDatosPacientes);
        pacienteElement.addEventListener('change', actualizarDatosPacientes);
    }
}

// Validación de documento (RUT)
function validarDocumento(input, mostrarError = false) {
    const valor = input.value.trim();
    const errorSpan = document.getElementById(`${input.id}_error`);
    
    let isValid = true;
    let mensaje = '';

    if (valor) {
        if (!/^\d{8}-[\dkK]$/.test(valor)) {
            isValid = false;
            mensaje = 'Formato inválido. Use: 12345678-9';
        } else {
            const [numero, dv] = valor.split('-');
            if (calcularDV(numero) !== dv.toLowerCase()) {
                isValid = false;
                mensaje = 'RUT inválido';
            }
        }
    }

    if (mostrarError || !isValid) {
        errorSpan.textContent = mensaje;
        input.classList.toggle('field-error', !isValid);
    }

    input.setCustomValidity(isValid ? '' : mensaje);
    return isValid;
}

// Cálculo de dígito verificador
function calcularDV(numero) {
    let suma = 0;
    let multiplicador = 2;
    
    for (let i = numero.length - 1; i >= 0; i--) {
        suma += parseInt(numero.charAt(i)) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    
    const resto = suma % 11;
    const dv = 11 - resto;
    
    if (dv === 11) return '0';
    if (dv === 10) return 'k';
    return dv.toString();
}

// Validación de edad
function validarEdad(input, mostrarError = false) {
    const valor = parseInt(input.value);
    const errorSpan = document.getElementById(`${input.id}_error`);
    
    let isValid = true;
    let mensaje = '';

    if (isNaN(valor)) {
        isValid = false;
        mensaje = 'Ingrese un número válido';
    } else if (valor < 0 || valor > EDAD_MAXIMA) {
        isValid = false;
        mensaje = `La edad debe estar entre 0 y ${EDAD_MAXIMA} años`;
    }

    if (mostrarError || !isValid) {
        errorSpan.textContent = mensaje;
        input.classList.toggle('field-error', !isValid);
    }

    input.setCustomValidity(isValid ? '' : mensaje);
    return isValid;
}

// Manejo de campos adicionales
function toggleCampoAdicional(pacienteId, condicion) {
    const checkbox = document.getElementById(`${pacienteId}_${condicion}`);
    const camposAdicionales = document.getElementById(`${pacienteId}_campos_adicionales`);
    const campoId = `${pacienteId}_${condicion}_adicional`;
    
    if (checkbox.checked) {
        const campoHTML = crearCampoAdicional(campoId, condicion);
        camposAdicionales.insertAdjacentHTML('beforeend', campoHTML);
        
        const campo = document.getElementById(campoId);
        campo.style.maxHeight = '0';
        campo.style.opacity = '0';
        
        requestAnimationFrame(() => {
            campo.style.maxHeight = campo.scrollHeight + 'px';
            campo.style.opacity = '1';
        });
    } else {
        const campo = document.getElementById(campoId);
        if (campo) {
            campo.style.maxHeight = '0';
            campo.style.opacity = '0';
            setTimeout(() => campo.remove(), 300);
        }
    }
    
    actualizarDatosPacientes();
}

// Crear campo adicional para condición médica
function crearCampoAdicional(campoId, condicion) {
    const config = CONDICIONES_MEDICAS[condicion];
    return `
        <div id="${campoId}" class="campo-condicional">
            <div class="form-group">
                <label for="${campoId}_input">${config.label}:</label>
                <input type="text" 
                       id="${campoId}_input"
                       placeholder="${config.placeholder}"
                       data-field="${condicion}_detalle"
                       required>
                <span class="error-message" id="${campoId}_input_error"></span>
            </div>
        </div>
    `;
}

// Función para eliminar paciente
function eliminarPaciente(pacienteId) {
    const confirmacion = confirm('¿Está seguro de eliminar este paciente?');
    if (confirmacion) {
        const paciente = document.getElementById(pacienteId);
        
        paciente.style.opacity = '0';
        paciente.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            paciente.remove();
            actualizarDatosPacientes();
        }, 300);
    }
}

// Actualización de datos
function actualizarDatosPacientes() {
    const pacientes = [];
    
    document.querySelectorAll('#listaPacientes .lista-item').forEach(item => {
        const pacienteId = item.id;
        
        const paciente = {
            documento: document.getElementById(`${pacienteId}_documento`)?.value?.trim() || '',
            nombre: document.getElementById(`${pacienteId}_nombre`)?.value?.trim() || '',
            edad: parseInt(document.getElementById(`${pacienteId}_edad`)?.value) || 0,
            genero: document.querySelector(`input[name="${pacienteId}_genero"]:checked`)?.value || '',
            condiciones: {}
        };

        // Procesar condiciones médicas
        Object.keys(CONDICIONES_MEDICAS).forEach(condicion => {
            const checkbox = document.getElementById(`${pacienteId}_${condicion}`);
            const detalleInput = document.getElementById(`${pacienteId}_${condicion}_adicional_input`);
            
            paciente.condiciones[condicion] = {
                presenta: checkbox?.checked || false,
                detalle: detalleInput?.value?.trim() || ''
            };
        });

        if (validarDatosPaciente(paciente, pacienteId)) {
            pacientes.push(paciente);
        }
    });

    window.StateManager.updateData('pacientes', pacientes);
}

// Validación de datos del paciente
function validarDatosPaciente(paciente, pacienteId) {
    let isValid = true;

    // Validar documento
    const documentoInput = document.getElementById(`${pacienteId}_documento`);
    if (!validarDocumento(documentoInput, true)) {
        isValid = false;
    }

    // Validar edad
    const edadInput = document.getElementById(`${pacienteId}_edad`);
    if (!validarEdad(edadInput, true)) {
        isValid = false;
    }

    // Validar nombre y género
    if (!paciente.nombre) {
        mostrarErrorCampo(`${pacienteId}_nombre`, 'El nombre es requerido');
        isValid = false;
    }

    if (!paciente.genero) {
        mostrarErrorCampo(`${pacienteId}_genero`, 'Seleccione un género');
        isValid = false;
    }

    // Validar detalles de condiciones médicas
    Object.entries(paciente.condiciones).forEach(([condicion, datos]) => {
        if (datos.presenta) {
            const detalleInput = document.getElementById(`${pacienteId}_${condicion}_adicional_input`);
            if (detalleInput && !detalleInput.value.trim()) {
                mostrarErrorCampo(detalleInput.id, 'Este campo es requerido');
                isValid = false;
            }
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
window.eliminarPaciente = eliminarPaciente;
window.toggleCampoAdicional = toggleCampoAdicional;
window.validarDocumento = validarDocumento;
window.validarEdad = validarEdad;