// Constantes de validación
const VALIDACION_CONFIGS = {
    minPacientes: 0,  // Mínimo de pacientes requeridos (0 si es opcional)
    minVehiculos: 0,  // Mínimo de vehículos requeridos (0 si es opcional)
    minUnidadesBomberos: 1,  // Mínimo una unidad de bomberos
    minVoluntarios: 1,  // Mínimo un voluntario
    tiempoMaximoRespuesta: 30 // Tiempo máximo de respuesta en minutos
};

// Patrones de validación
const PATRONES = {
    rut: /^\d{7,8}-[\dkK]$/,
    codigoBomberos: /^(B|BX|Q|M|MX|R|RX|RB|RH|H|X|Z|UT|BR|QR)-[1-8]$|^[KS]-\d+$/,
    matriculaAuto: /^[A-Z]{4}\d{2}$|^[A-Z]{2}\d{4}$/,
    matriculaMoto: /^[A-Z]{2}\d{2}[A-Z]{2}$|^[A-Z]{2}\d{3}$/,
    codigoCarabineros: /^[A-Z]-\d+$/,
    codigoAmbulancia: /^SAMU-\d+$/
};

// Función principal de validación del formulario
function validarFormularioCompleto(data = window.StateManager.getData()) {
    const errores = [];

    try {
        validarInformacionBasica(data, errores);
        validarMandos(data, errores);
        validarTiemposRespuesta(data, errores);
        validarUbicacion(data, errores);
        validarPacientes(data, errores);
        validarVehiculos(data, errores);
        validarUnidadesConcurrentes(data, errores);
        validarListaAsistencia(data, errores);
    } catch (error) {
        console.error('Error en validación:', error);
        errores.push('Error en la validación del formulario');
    }

    return {
        esValido: errores.length === 0,
        errores
    };
}

// Validación de información básica
function validarInformacionBasica(data, errores) {
    const { emergencia } = data;
    const camposRequeridos = ['fecha', 'horaSalida', 'horaLlegada', 'tipoEmergencia', 'magnitud'];

    camposRequeridos.forEach(campo => {
        if (!emergencia[campo]) {
            errores.push(`El campo ${campo.replace(/([A-Z])/g, ' $1').toLowerCase()} es obligatorio`);
        }
    });
}

// Validación de mandos
function validarMandos(data, errores) {
    const { emergencia } = data;

    // Validar OBAC
    if (!emergencia.obac.nombre || !emergencia.obac.cargo) {
        errores.push('La información del OBAC es obligatoria');
    }

    // Validar compañía para cargos que la requieren
    if (['teniente1', 'teniente2', 'teniente3', 'capitan', 'voluntario'].includes(emergencia.obac.cargo) 
        && !emergencia.obac.compania) {
        errores.push('Debe especificar la compañía del OBAC');
    }

    // Validar Mando de Compañía
    if (!emergencia.mandoCompania.nombre || !emergencia.mandoCompania.cargo) {
        errores.push('La información del Mando de Compañía es obligatoria');
    }
}

// Validación de tiempos de respuesta
function validarTiemposRespuesta(data, errores) {
    const { emergencia } = data;

    if (emergencia.fecha && emergencia.horaSalida && emergencia.horaLlegada) {
        const fechaSalida = new Date(`${emergencia.fecha}T${emergencia.horaSalida}`);
        let fechaLlegada = new Date(`${emergencia.fecha}T${emergencia.horaLlegada}`);

        // Si la hora de llegada es menor, asumimos que es del día siguiente
        if (fechaLlegada < fechaSalida) {
            fechaLlegada.setDate(fechaLlegada.getDate() + 1);
        }

        const tiempoRespuesta = (fechaLlegada - fechaSalida) / (1000 * 60); // Convertir a minutos

        if (tiempoRespuesta > VALIDACION_CONFIGS.tiempoMaximoRespuesta) {
            errores.push(`El tiempo de respuesta excede el máximo permitido (${VALIDACION_CONFIGS.tiempoMaximoRespuesta} minutos)`);
        }
    }
}

// Validación de ubicación
function validarUbicacion(data, errores) {
    const { emergencia } = data;

    if (!emergencia.direccion) {
        errores.push('La dirección es obligatoria');
    }

    if (!emergencia.coordenadas || !Array.isArray(emergencia.coordenadas) || emergencia.coordenadas.length !== 2) {
        errores.push('Debe seleccionar la ubicación en el mapa');
    }
}

// Validación de pacientes
function validarPacientes(data, errores) {
    const { pacientes } = data;

    if (pacientes.length < VALIDACION_CONFIGS.minPacientes) {
        if (VALIDACION_CONFIGS.minPacientes > 0) {
            errores.push(`Se requiere al menos ${VALIDACION_CONFIGS.minPacientes} paciente(s)`);
        }
        return;
    }

    pacientes.forEach((paciente, index) => {
        // Validar documento
        if (!validarRut(paciente.documento)) {
            errores.push(`Paciente ${index + 1}: RUT inválido`);
        }

        // Validar campos obligatorios
        if (!paciente.nombre) {
            errores.push(`Paciente ${index + 1}: Falta nombre`);
        }
        if (!paciente.edad || paciente.edad < 0 || paciente.edad > 120) {
            errores.push(`Paciente ${index + 1}: Edad inválida`);
        }
        if (!paciente.genero) {
            errores.push(`Paciente ${index + 1}: Falta género`);
        }

        // Validar condiciones médicas
        Object.entries(paciente.condiciones).forEach(([condicion, datos]) => {
            if (datos.presenta && !datos.detalle) {
                errores.push(`Paciente ${index + 1}: Falta detalle de ${condicion}`);
            }
        });
    });
}

// Validación de vehículos
function validarVehiculos(data, errores) {
    const { vehiculos } = data;

    if (vehiculos.length < VALIDACION_CONFIGS.minVehiculos) {
        if (VALIDACION_CONFIGS.minVehiculos > 0) {
            errores.push(`Se requiere al menos ${VALIDACION_CONFIGS.minVehiculos} vehículo(s)`);
        }
        return;
    }

    vehiculos.forEach((vehiculo, index) => {
        if (!vehiculo.tipo) {
            errores.push(`Vehículo ${index + 1}: Falta tipo de vehículo`);
            return;
        }

        // Validar matrícula si es requerida
        if (vehiculo.tipo !== 'bicicleta' && vehiculo.tipo !== 'traccion_animal') {
            const patron = vehiculo.tipo === 'dos_ruedas' ? PATRONES.matriculaMoto : PATRONES.matriculaAuto;
            if (!patron.test(vehiculo.matricula)) {
                errores.push(`Vehículo ${index + 1}: Matrícula inválida`);
            }
        }

        // Validar campos obligatorios
        if (!vehiculo.marca) errores.push(`Vehículo ${index + 1}: Falta marca`);
        if (!vehiculo.modelo) errores.push(`Vehículo ${index + 1}: Falta modelo`);
        if (!vehiculo.anio || vehiculo.anio < 1900 || vehiculo.anio > new Date().getFullYear() + 1) {
            errores.push(`Vehículo ${index + 1}: Año inválido`);
        }
    });
}

// Validación de unidades concurrentes
function validarUnidadesConcurrentes(data, errores) {
    const { unidadesBomberos, unidadesCarabineros, unidadesAmbulancia } = data;

    // Validar unidades de bomberos (obligatorio)
    if (unidadesBomberos.length < VALIDACION_CONFIGS.minUnidadesBomberos) {
        errores.push(`Se requiere al menos ${VALIDACION_CONFIGS.minUnidadesBomberos} unidad(es) de bomberos`);
    }

    // Validar códigos de unidades
    unidadesBomberos.forEach((unidad, index) => {
        if (!PATRONES.codigoBomberos.test(unidad.codigo)) {
            errores.push(`Unidad de bomberos ${index + 1}: Código inválido`);
        }
    });

    unidadesCarabineros.forEach((unidad, index) => {
        if (!PATRONES.codigoCarabineros.test(unidad.codigo)) {
            errores.push(`Unidad de carabineros ${index + 1}: Código inválido`);
        }
        if (!unidad.comisaria) {
            errores.push(`Unidad de carabineros ${index + 1}: Falta comisaría`);
        }
    });

    unidadesAmbulancia.forEach((unidad, index) => {
        if (!PATRONES.codigoAmbulancia.test(unidad.codigo)) {
            errores.push(`Unidad de ambulancia ${index + 1}: Código inválido`);
        }
        if (!unidad.encargado || !unidad.cargo || !unidad.base) {
            errores.push(`Unidad de ambulancia ${index + 1}: Información incompleta`);
        }
    });
}

// Validación de lista de asistencia
function validarListaAsistencia(data, errores) {
    const { voluntarios } = data;

    if (voluntarios.length < VALIDACION_CONFIGS.minVoluntarios) {
        errores.push(`Se requiere al menos ${VALIDACION_CONFIGS.minVoluntarios} voluntario(s) en la lista de asistencia`);
        return;
    }

    voluntarios.forEach((voluntario, index) => {
        if (!voluntario.codigo || !/^\d+$/.test(voluntario.codigo)) {
            errores.push(`Voluntario ${index + 1}: Código inválido`);
        }
        if (!voluntario.nombre) {
            errores.push(`Voluntario ${index + 1}: Falta nombre`);
        }
        if (!voluntario.cargo) {
            errores.push(`Voluntario ${index + 1}: Falta cargo`);
        }
    });
}

// Función auxiliar para validar RUT
function validarRut(rut) {
    if (!PATRONES.rut.test(rut)) return false;
    
    const [numero, dv] = rut.split('-');
    return dv.toLowerCase() === calcularDV(numero).toLowerCase();
}

// Función auxiliar para calcular dígito verificador
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

// Exportar funciones necesarias
window.validarFormularioCompleto = validarFormularioCompleto;