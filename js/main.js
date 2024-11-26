// Variables globales
let map;
let marker;
const UIConfig = {
    showLoadingDelay: 300,
    animationDuration: 300,
    autoSaveInterval: 30000
};

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
    initializeFormHandlers();
    initializeMapHandlers();
    initializeCargoHandlers();
    initializeDateTimeHandlers();
    initializeNavigationHandlers();
    initializeValidationHandlers();
});

// Inicialización de manejadores del formulario principal
function initializeFormHandlers() {
    const emergencyForm = document.getElementById('emergencyForm');
    emergencyForm.addEventListener('submit', handleEmergencyFormSubmit);

    // Manejar cambios en campos del formulario
    document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(element => {
        element.addEventListener('input', handleFieldValidation);
        element.addEventListener('blur', handleFieldValidation);
        element.addEventListener('change', actualizarDatosEmergencia);
    });
}

function handleFieldValidation(event) {
    const field = event.target;
    const fieldId = field.id;
    const errorSpan = document.getElementById(`${fieldId}_error`);
    
    field.classList.remove('field-error');
    if (errorSpan) {
        errorSpan.textContent = '';
    }
    
    if (!field.checkValidity()) {
        field.classList.add('field-error');
        if (errorSpan) {
            errorSpan.textContent = field.validationMessage;
        }
    }
}

// Inicialización y manejo del mapa
function initializeMapHandlers() {
    const mostrarMapaBtn = document.getElementById('mostrarMapa');
    const mapaContainer = document.getElementById('mapaContainer');
    const direccionManual = document.getElementById('direccionManual');

    mostrarMapaBtn.addEventListener('click', () => {
        const isVisible = mapaContainer.style.display !== 'none';
        
        if (!isVisible) {
            mapaContainer.style.display = 'block';
            setTimeout(() => {
                mapaContainer.classList.add('active');
                if (!map) {
                    initializeMap();
                } else {
                    map.invalidateSize();
                }
            }, 10);
        } else {
            mapaContainer.classList.remove('active');
            setTimeout(() => {
                mapaContainer.style.display = 'none';
            }, 300);
        }
    });

    direccionManual.addEventListener('change', async () => {
        try {
            const direccion = direccionManual.value.trim();
            if (!direccion) {
                throw new Error('Dirección vacía');
            }
            
            window.UIManager.showLoading('Buscando dirección...');
            const coordinates = await geocodeAddress(direccion);
            updateMapMarker(coordinates);
            actualizarDatosEmergencia();
            
        } catch (error) {
            console.error('Error al geocodificar:', error);
            window.UIManager.showError('No se pudo encontrar la ubicación. Por favor, seleccione en el mapa.');
        } finally {
            window.UIManager.hideLoading();
        }
    });
}

// Inicialización del mapa
function initializeMap() {
    const defaultPosition = [-34.9828, -71.2333]; // Curicó
    
    map = L.map('mapa', {
        center: defaultPosition,
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        minZoom: 3
    }).addTo(map);

    // Control de búsqueda
    const searchControl = L.Control.geocoder({
        defaultMarkGeocode: false,
        placeholder: 'Buscar dirección...',
        errorMessage: 'No se encontró la dirección',
        showResultIcons: true
    }).addTo(map);

    searchControl.on('markgeocode', function(e) {
        const latlng = e.geocode.center;
        updateMapMarker(latlng);
        map.setView(latlng, 16);
        reverseGeocode(latlng);
    });

    map.on('click', (e) => {
        updateMapMarker(e.latlng);
        reverseGeocode(e.latlng);
    });
}

// Manejo de cargos y compañías
function initializeCargoHandlers() {
    const obacCargo = document.getElementById('obacCargo');
    const obacCompania = document.getElementById('obacCompaniaGroup');
    
    obacCargo.addEventListener('change', () => {
        const requiereCompania = ['teniente1', 'teniente2', 'teniente3', 'capitan', 'voluntario'].includes(obacCargo.value);
        
        if (requiereCompania) {
            obacCompania.style.display = 'block';
            setTimeout(() => obacCompania.classList.add('active'), 10);
            document.getElementById('obacCompania').required = true;
        } else {
            obacCompania.classList.remove('active');
            setTimeout(() => {
                obacCompania.style.display = 'none';
                document.getElementById('obacCompania').required = false;
                document.getElementById('obacCompania').value = '';
            }, 300);
        }
        
        actualizarDatosEmergencia();
    });
}

// Resto del código existente para initializeDateTimeHandlers y otras funciones...

// Actualizar marcador del mapa
function updateMapMarker(latlng) {
    if (marker) {
        marker.setLatLng(latlng);
    } else {
        marker = L.marker(latlng, {
            draggable: true
        }).addTo(map);

        marker.on('dragend', (event) => {
            const position = event.target.getLatLng();
            reverseGeocode(position);
        });
    }

    map.setView(latlng);
    window.StateManager.updateData('emergencia', {
        ...window.StateManager.getData('emergencia'),
        coordenadas: [latlng.lat, latlng.lng]
    });
}

// Actualizar datos de emergencia
function actualizarDatosEmergencia() {
    const emergencia = {
        obac: {
            nombre: document.getElementById('obacNombre').value,
            cargo: document.getElementById('obacCargo').value,
            compania: document.getElementById('obacCompania').value
        },
        mandoCompania: {
            nombre: document.getElementById('mandoCompaniaNombre').value,
            cargo: document.getElementById('mandoCompaniaCargo').value,
            compania: '6' // Siempre Sexta
        },
        fecha: document.getElementById('fecha').value,
        horaSalida: document.getElementById('horaSalida').value,
        horaLlegada: document.getElementById('horaLlegada').value,
        direccion: document.getElementById('direccionManual').value,
        coordenadas: marker ? [marker.getLatLng().lat, marker.getLatLng().lng] : null,
        tipoEmergencia: document.getElementById('tipoEmergencia').value,
        magnitud: document.getElementById('magnitud').value,
        puntoOrigen: document.getElementById('puntoOrigen').value,
        observaciones: document.getElementById('observaciones').value
    };

    window.StateManager.updateData('emergencia', emergencia);
}

// Exportar funciones y variables necesarias
window.updateFormData = function(key, value) {
    window.StateManager.updateData(key, value);
};