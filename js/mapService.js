const MapService = {
    // Variables del mapa
    map: null,
    marker: null,
    searchControl: null,
    defaultPosition: [-34.9828, -71.2333], // Curicó
    defaultZoom: 13,

    // Configuración
    config: {
        tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors',
        nominatimUrl: 'https://nominatim.openstreetmap.org',
        maxZoom: 19,
        minZoom: 3,
        markerDraggable: true,
        searchZoom: 16,
        geocodeDelay: 1000
    },

    // Inicialización del servicio
    async init(containerId = 'mapa') {
        try {
            if (!window.L) {
                throw new Error('Leaflet no está cargado');
            }

            this.map = L.map(containerId, {
                center: this.defaultPosition,
                zoom: this.defaultZoom,
                zoomControl: true,
                scrollWheelZoom: true
            });

            L.tileLayer(this.config.tileLayer, {
                attribution: this.config.attribution,
                maxZoom: this.config.maxZoom,
                minZoom: this.config.minZoom
            }).addTo(this.map);

            await this.initializeControls();
            this.setupEventListeners();

            return true;
        } catch (error) {
            console.error('Error al inicializar el mapa:', error);
            throw error;
        }
    },

    // Inicializar controles del mapa
    async initializeControls() {
        this.searchControl = L.Control.geocoder({
            defaultMarkGeocode: false,
            placeholder: 'Buscar dirección...',
            errorMessage: 'No se encontró la dirección',
            showResultIcons: true,
            geocoder: L.Control.Geocoder.nominatim({
                serviceUrl: this.config.nominatimUrl
            })
        }).addTo(this.map);

        L.control.zoom({
            position: 'bottomright'
        }).addTo(this.map);

        L.control.scale({
            metric: true,
            imperial: false,
            position: 'bottomleft'
        }).addTo(this.map);
    },

    // Configurar event listeners
    setupEventListeners() {
        this.map.on('click', (e) => {
            this.updateMarker(e.latlng);
            this.reverseGeocode(e.latlng);
        });

        this.searchControl.on('markgeocode', (e) => {
            const latlng = e.geocode.center;
            this.updateMarker(latlng);
            this.map.setView(latlng, this.config.searchZoom);
            this.reverseGeocode(latlng);
        });
    },

    // Actualizar marcador
    updateMarker(latlng) {
        if (this.marker) {
            this.marker.setLatLng(latlng);
        } else {
            this.marker = L.marker(latlng, {
                draggable: this.config.markerDraggable
            }).addTo(this.map);

            if (this.config.markerDraggable) {
                this.marker.on('dragend', (event) => {
                    const position = event.target.getLatLng();
                    this.reverseGeocode(position);
                });
            }
        }

        window.StateManager.updateData('emergencia', {
            ...window.StateManager.getData('emergencia'),
            coordenadas: [latlng.lat, latlng.lng]
        });
    },

    // Geocodificación inversa (coordenadas a dirección)
    async reverseGeocode(latlng) {
        try {
            window.UIManager.showLoading('Obteniendo dirección...');

            const response = await fetch(
                `${this.config.nominatimUrl}/reverse?` +
                `format=json&lat=${latlng.lat}&lon=${latlng.lng}&addressdetails=1`
            );

            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }

            const data = await response.json();

            if (data.display_name) {
                const direccionInput = document.getElementById('direccionManual');
                if (direccionInput) {
                    direccionInput.value = data.display_name;
                }

                window.StateManager.updateData('emergencia', {
                    ...window.StateManager.getData('emergencia'),
                    direccion: data.display_name
                });

                return data.display_name;
            }
        } catch (error) {
            console.error('Error en geocodificación inversa:', error);
            window.UIManager.showError('Error al obtener la dirección');
        } finally {
            window.UIManager.hideLoading();
        }
    },

    // Geocodificación (dirección a coordenadas)
    async geocodeAddress(address) {
        try {
            window.UIManager.showLoading('Buscando dirección...');

            const response = await fetch(
                `${this.config.nominatimUrl}/search?` +
                `format=json&q=${encodeURIComponent(address)}&limit=1`
            );

            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }

            const data = await response.json();

            if (data.length === 0) {
                throw new Error('No se encontraron resultados');
            }

            const latlng = {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };

            this.updateMarker(latlng);
            this.map.setView(latlng, this.config.searchZoom);

            return latlng;
        } catch (error) {
            console.error('Error en geocodificación:', error);
            window.UIManager.showError('Error al buscar la dirección');
            throw error;
        } finally {
            window.UIManager.hideLoading();
        }
    },

    // Funciones de utilidad
    centerMap(latlng = null, zoom = null) {
        if (this.map) {
            this.map.setView(
                latlng || this.marker?.getLatLng() || this.defaultPosition,
                zoom || this.map.getZoom() || this.defaultZoom
            );
        }
    },

    getBounds() {
        return this.map ? this.map.getBounds() : null;
    },

    updateSize() {
        if (this.map) {
            this.map.invalidateSize();
        }
    },

    clearMarker() {
        if (this.marker) {
            this.marker.remove();
            this.marker = null;
        }
    },

    reset() {
        this.clearMarker();
        this.centerMap(this.defaultPosition, this.defaultZoom);
    },

    destroy() {
        if (this.map) {
            this.map.remove();
            this.map = null;
            this.marker = null;
            this.searchControl = null;
        }
    }
};

// Exportar servicio
window.MapService = MapService;