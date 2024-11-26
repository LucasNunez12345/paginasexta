// Contador para IDs únicos de voluntarios
let voluntarioCounter = 0;

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
    initializeAsistenciaHandlers();
});

function initializeAsistenciaHandlers() {
    const btnAgregarVoluntario = document.getElementById('agregarVoluntario');
    if (btnAgregarVoluntario) {
        btnAgregarVoluntario.addEventListener('click', agregarVoluntario);
    }

    const btnVolver = document.getElementById('btnVolver');
    if (btnVolver) {
        btnVolver.addEventListener('click', volverAEmergencia);
    }

    const btnGenerarPDF = document.getElementById('btnGenerarPDF');
    if (btnGenerarPDF) {
        btnGenerarPDF.addEventListener('click', handleGenerarPDF);
    }
}

// Función para agregar un nuevo voluntario
function agregarVoluntario() {
    const listaVoluntarios = document.getElementById('listaVoluntarios');
    const voluntarioId = `voluntario_${voluntarioCounter++}`;
    
    const voluntarioHTML = `
        <div class="lista-item voluntario-item" id="${voluntarioId}">
            <button type="button" class="btn-icon eliminar" onclick="eliminarVoluntario('${voluntarioId}')">
                <span class="icon-close"></span>
            </button>
            
            <div class="grid-3">
                <div class="form-group">
                    <label for="${voluntarioId}_codigo">Código:</label>
                    <div class="input-with-tooltip">
                        <input type="text" 
                               id="${voluntarioId}_codigo" 
                               required 
                               data-field="codigo">
                        <div class="tooltip">
                            <span class="tooltip-text">Ingrese el código del voluntario</span>
                        </div>
                    </div>
                    <span class="error-message" id="${voluntarioId}_codigo_error"></span>
                </div>

                <div class="form-group">
                    <label for="${voluntarioId}_nombre">Nombre Completo:</label>
                    <input type="text" 
                           id="${voluntarioId}_nombre" 
                           required 
                           data-field="nombre">
                    <span class="error-message" id="${voluntarioId}_nombre_error"></span>
                </div>

                <div class="form-group">
                    <label for="${voluntarioId}_cargo">Cargo:</label>
                    <select id="${voluntarioId}_cargo" 
                            required 
                            data-field="cargo">
                        <option value="">Seleccione cargo</option>
                        <option value="capitan">Capitán</option>
                        <option value="teniente1">Teniente 1°</option>
                        <option value="teniente2">Teniente 2°</option>
                        <option value="teniente3">Teniente 3°</option>
                        <option value="voluntario">Voluntario</option>
                    </select>
                    <span class="error-message" id="${voluntarioId}_cargo_error"></span>
                </div>
            </div>
        </div>
    `;

    listaVoluntarios.insertAdjacentHTML('beforeend', voluntarioHTML);
    
    const nuevoVoluntario = document.getElementById(voluntarioId);
    nuevoVoluntario.style.opacity = '0';
    nuevoVoluntario.style.transform = 'translateY(-20px)';
    
    requestAnimationFrame(() => {
        nuevoVoluntario.style.opacity = '1';
        nuevoVoluntario.style.transform = 'translateY(0)';
        nuevoVoluntario.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
    
    initializeVoluntarioValidation(voluntarioId);
    actualizarDatosVoluntarios();
}

// Inicializar validaciones para un voluntario
function initializeVoluntarioValidation(voluntarioId) {
    const inputs = document.querySelectorAll(`#${voluntarioId} input, #${voluntarioId} select`);
    
    inputs.forEach(input => {
        input.addEventListener('input', () => validarCampoVoluntario(input));
        input.addEventListener('blur', () => validarCampoVoluntario(input, true));
    });
}

// Validar campo de voluntario
function validarCampoVoluntario(input, showError = false) {
    const field = input.dataset.field;
    const value = input.value.trim();
    const errorSpan = document.getElementById(`${input.id}_error`);
    
    let isValid = true;
    let mensaje = '';

    if (!value) {
        isValid = false;
        mensaje = 'Este campo es requerido';
    } else if (field === 'codigo') {
        if (!/^\d+$/.test(value)) {
            isValid = false;
            mensaje = 'El código debe contener solo números';
        }
    }

    input.classList.toggle('field-error', !isValid && showError);
    if (errorSpan) {
        errorSpan.textContent = showError ? mensaje : '';
    }

    return isValid;
}

// Función para eliminar voluntario
function eliminarVoluntario(voluntarioId) {
    const confirmacion = confirm('¿Está seguro de eliminar este voluntario?');
    if (confirmacion) {
        const voluntario = document.getElementById(voluntarioId);
        
        voluntario.style.opacity = '0';
        voluntario.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            voluntario.remove();
            actualizarDatosVoluntarios();
        }, 300);
    }
}

// Función para volver al formulario de emergencia
function volverAEmergencia() {
    const asistenciaForm = document.getElementById('asistenciaForm');
    const emergencyForm = document.getElementById('emergencyForm');
    
    asistenciaForm.style.opacity = '0';
    asistenciaForm.style.transform = 'translateX(20px)';
    
    setTimeout(() => {
        asistenciaForm.style.display = 'none';
        emergencyForm.style.display = 'block';
        
        requestAnimationFrame(() => {
            emergencyForm.style.opacity = '1';
            emergencyForm.style.transform = 'translateX(0)';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }, 300);
}

// Manejar generación de PDF
async function handleGenerarPDF() {
    if (validarAsistencia()) {
        try {
            window.UIManager.showLoading('Generando PDF...');
            await window.generarPDF();
            window.UIManager.showMessage('PDF generado exitosamente', 'success');
        } catch (error) {
            console.error('Error al generar PDF:', error);
            window.UIManager.showError('Error al generar el PDF. Por favor, intente nuevamente.');
        } finally {
            window.UIManager.hideLoading();
        }
    } else {
        window.UIManager.showError('Por favor, complete todos los campos obligatorios de la lista de asistencia.');
    }
}

// Validar lista de asistencia
function validarAsistencia() {
    const voluntarios = document.querySelectorAll('#listaVoluntarios .lista-item');
    
    if (voluntarios.length === 0) {
        return false;
    }

    let isValid = true;
    voluntarios.forEach(item => {
        const inputs = item.querySelectorAll('input, select');
        inputs.forEach(input => {
            if (!validarCampoVoluntario(input, true)) {
                isValid = false;
            }
        });
    });

    return isValid;
}

// Actualizar datos de voluntarios
function actualizarDatosVoluntarios() {
    const voluntarios = [];
    
    document.querySelectorAll('#listaVoluntarios .lista-item').forEach(item => {
        const voluntarioId = item.id;
        const codigo = document.getElementById(`${voluntarioId}_codigo`)?.value?.trim();
        const nombre = document.getElementById(`${voluntarioId}_nombre`)?.value?.trim();
        const cargo = document.getElementById(`${voluntarioId}_cargo`)?.value;

        if (codigo && nombre && cargo) {
            voluntarios.push({ codigo, nombre, cargo });
        }
    });

    window.StateManager.updateData('voluntarios', voluntarios);
}

// Exportar funciones necesarias
window.eliminarVoluntario = eliminarVoluntario;
window.validarAsistencia = validarAsistencia;