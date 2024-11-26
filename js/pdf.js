// Funciones de traducción y formateo
const TRADUCCIONES = {
    cargos: {
        'comandante1': 'Comandante 1°',
        'comandante2': 'Comandante 2°',
        'comandante3': 'Comandante 3°',
        'capitan': 'Capitán',
        'teniente1': 'Teniente 1°',
        'teniente2': 'Teniente 2°',
        'teniente3': 'Teniente 3°',
        'voluntario': 'Voluntario'
    },
    companias: {
        '1': 'Primera',
        '2': 'Segunda',
        '3': 'Tercera',
        '4': 'Cuarta',
        '5': 'Quinta',
        '6': 'Sexta',
        '7': 'Séptima',
        '8': 'Octava'
    },
    tiposVehiculo: {
        'automovil': 'Automóvil',
        'dos_ruedas': 'Vehículo de dos ruedas',
        'tres_ruedas': 'Vehículo de tres ruedas',
        'traccion_animal': 'Vehículo de tracción animal',
        'transporte_personas': 'Transporte de personas',
        'transporte_carga': 'Transporte de carga',
        'agricola': 'Vehículo agrícola',
        'bicicleta': 'Bicicleta'
    }
};

// Funciones de formateo mejoradas
function formatearCondicionMedica(condicion) {
    if (!condicion) return 'NO';
    return condicion.presenta ? (condicion.ubicacion ? `SÍ - ${condicion.ubicacion}` : 'SÍ') : 'NO';
}

function formatearFechaHora(fecha, hora) {
    if (!fecha || !hora) return '-';
    const datetime = new Date(`${fecha}T${hora}`);
    return datetime.toLocaleString('es-CL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

function formatearCoordenadas(coordenadas) {
    if (!coordenadas || !Array.isArray(coordenadas)) return '-';
    return `${coordenadas[0].toFixed(6)}, ${coordenadas[1].toFixed(6)}`;
}

function formatearMando(mando) {
    if (!mando || !mando.nombre || !mando.cargo) return '-';
    let texto = `${mando.nombre} - ${TRADUCCIONES.cargos[mando.cargo] || mando.cargo}`;
    if (['teniente1', 'teniente2', 'teniente3', 'capitan', 'voluntario'].includes(mando.cargo) && mando.compania) {
        texto += ` - ${TRADUCCIONES.companias[mando.compania] || mando.compania}`;
    }
    return texto;
}

// Funciones para el manejo de páginas y contenido
class PDFGenerator {
    constructor() {
        if (!window.jspdf || !window.jspdf.jsPDF) {
            throw new Error('jsPDF no está disponible');
        }
        
        this.doc = new window.jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        this.yPos = 20;
        this.pageHeight = this.doc.internal.pageSize.height;
        this.pageWidth = this.doc.internal.pageSize.width;
        this.margins = {
            top: 20,
            bottom: 20,
            left: 15,
            right: 15
        };
    }

    checkPageBreak(height) {
        if (this.yPos + height > this.pageHeight - this.margins.bottom) {
            this.doc.addPage();
            this.yPos = this.margins.top;
            return true;
        }
        return false;
    }

    agregarEncabezado() {
        this.doc.setFontSize(16);
        this.doc.text('PARTE DE CONCURRENCIA A EMERGENCIAS', this.pageWidth/2, this.yPos, { align: 'center' });
        this.yPos += 10;
        
        this.doc.setFontSize(14);
        this.doc.text('Sexta Compañía de Bomberos - Curicó', this.pageWidth/2, this.yPos, { align: 'center' });
        this.yPos += 15;
    }

    crearTabla(data, columnWidths, rowHeight = 8) {
        this.doc.setFontSize(10);
        this.doc.setLineWidth(0.2);

        const startX = this.margins.left;
        const totalWidth = columnWidths.reduce((a, b) => a + b, 0);
        const totalHeight = data.length * rowHeight;

        // Verificar si necesitamos nueva página
        if (this.checkPageBreak(totalHeight)) {
            // Si es nueva página, agregar encabezado si es necesario
        }

        data.forEach((row, rowIndex) => {
            let currentX = startX;

            // Dibujar línea horizontal superior de la fila
            this.doc.line(startX, this.yPos, startX + totalWidth, this.yPos);

            row.forEach((cell, colIndex) => {
                // Dibujar línea vertical
                this.doc.line(currentX, this.yPos, currentX, this.yPos + rowHeight);
                
                // Calcular posición del texto
                const cellWidth = columnWidths[colIndex];
                const texto = cell || '-';
                const textWidth = this.doc.getStringUnitWidth(texto) * 
                                this.doc.internal.getFontSize() / 
                                this.doc.internal.scaleFactor;
                const textX = currentX + (cellWidth - textWidth) / 2;
                
                // Escribir texto
                this.doc.text(texto, textX, this.yPos + 5.5);
                currentX += cellWidth;
            });

            // Dibujar última línea vertical
            this.doc.line(currentX, this.yPos, currentX, this.yPos + rowHeight);
            this.yPos += rowHeight;
        });

        // Dibujar última línea horizontal
        this.doc.line(startX, this.yPos, startX + totalWidth, this.yPos);
        this.yPos += 5; // Espacio después de la tabla
    }
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

    // Listener para actualización automática
    const pacienteElement = document.getElementById(pacienteId);
    if (pacienteElement) {
        pacienteElement.addEventListener('input', actualizarDatosPacientes);
        pacienteElement.addEventListener('change', actualizarDatosPacientes);
    }
}

// Validación de documento mejorada
function validarDocumento(input, mostrarError = false) {
    const valor = input.value.trim();
    const pattern = /^\d{8}-\d{1}$/;
    const errorSpan = document.getElementById(`${input.id}_error`);
    
    let isValid = true;
    let mensaje = '';

    if (valor) {
        if (!pattern.test(valor)) {
            isValid = false;
            mensaje = 'Formato inválido. Use: 12345678-9';
        } else {
            // Validar dígito verificador
            const rut = valor.split('-')[0];
            const dv = valor.split('-')[1];
            if (calcularDV(rut) !== dv) {
                isValid = false;
                mensaje = 'Número de documento inválido';
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
function calcularDV(rut) {
    let suma = 0;
    let multiplicador = 2;
    
    for (let i = rut.length - 1; i >= 0; i--) {
        suma += parseInt(rut.charAt(i)) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    
    const resto = suma % 11;
    const dv = 11 - resto;
    
    if (dv === 11) return '0';
    if (dv === 10) return 'K';
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
    
    // ID único para el campo adicional
    const campoId = `${pacienteId}_${condicion}_adicional`;
    
    if (checkbox.checked) {
        // Agregar campo según el tipo de condición
        const campoHTML = crearCampoAdicional(campoId, condicion);
        camposAdicionales.insertAdjacentHTML('beforeend', campoHTML);
        
        // Animar entrada
        requestAnimationFrame(() => {
            const campo = document.getElementById(campoId);
            campo.style.maxHeight = campo.scrollHeight + 'px';
            campo.style.opacity = '1';
        });
    } else {
        // Animar salida y remover
        const campo = document.getElementById(campoId);
        if (campo) {
            campo.style.maxHeight = '0';
            campo.style.opacity = '0';
            setTimeout(() => campo.remove(), 300);
        }
    }
    
    actualizarDatosPacientes();
}

// Crear campo adicional según tipo de condición
function crearCampoAdicional(campoId, condicion) {
    const configs = {
        sangramiento: {
            label: 'Ubicación del Sangramiento',
            placeholder: 'Indique la ubicación'
        },
        dolor: {
            label: 'Ubicación e Intensidad del Dolor',
            placeholder: 'Describa ubicación e intensidad (1-10)'
        },
        lesionCervical: {
            label: 'Detalles de la Lesión Cervical',
            placeholder: 'Describa los detalles'
        },
        traumatismo: {
            label: 'Detalles del Traumatismo',
            placeholder: 'Describa tipo y ubicación'
        }
    };

    const config = configs[condicion];
    return `
        <div id="${campoId}" class="campo-adicional">
            <div class="form-group">
                <label for="${campoId}_input">${config.label}:</label>
                <input type="text" 
                       id="${campoId}_input"
                       placeholder="${config.placeholder}"
                       required>
            </div>
        </div>
    `;
}

// Función para eliminar paciente
function eliminarPaciente(pacienteId) {
    const confirmacion = confirm('¿Está seguro de eliminar este paciente?');
    if (confirmacion) {
        const paciente = document.getElementById(pacienteId);
        if (paciente) {
            // Animar salida
            paciente.style.opacity = '0';
            paciente.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                paciente.remove();
                actualizarDatosPacientes();
            }, 300);
        }
    }
}

// Obtener datos de una condición médica
function obtenerCondicionMedica(pacienteId, condicion) {
    const checkbox = document.getElementById(`${pacienteId}_${condicion}`);
    const detalleInput = document.getElementById(`${pacienteId}_${condicion}_adicional_input`);
    
    return {
        presenta: checkbox?.checked || false,
        detalle: detalleInput?.value?.trim() || ''
    };
}

// Actualización de datos mejorada
function actualizarDatosPacientes() {
    const pacientes = [];
    
    document.querySelectorAll('#listaPacientes .lista-item').forEach(item => {
        const pacienteId = item.id;
        
        const paciente = {
            documento: document.getElementById(`${pacienteId}_documento`)?.value?.trim() || '',
            nombre: document.getElementById(`${pacienteId}_nombre`)?.value?.trim() || '',
            edad: parseInt(document.getElementById(`${pacienteId}_edad`)?.value) || 0,
            genero: document.querySelector(`input[name="${pacienteId}_genero"]:checked`)?.value || '',
            tipoSangre: document.getElementById(`${pacienteId}_tipo_sangre`)?.value || '',
            condiciones: {
                sangramiento: obtenerCondicionMedica(pacienteId, 'sangramiento'),
                dolor: obtenerCondicionMedica(pacienteId, 'dolor'),
                lesionCervical: obtenerCondicionMedica(pacienteId, 'lesionCervical'),
                traumatismo: obtenerCondicionMedica(pacienteId, 'traumatismo')
            }
        };

        pacientes.push(paciente);
    });

    // Actualizar el objeto global formData
    window.updateFormData('pacientes', pacientes);
}

// Exportar funciones necesarias
window.eliminarPaciente = eliminarPaciente;
window.toggleCampoAdicional = toggleCampoAdicional;
window.validarDocumento = validarDocumento;
window.validarEdad = validarEdad;