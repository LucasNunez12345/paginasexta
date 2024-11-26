const AppConfig = {
    version: '1.0.0',
    debug: false,
    autoSaveInterval: 30000,
    maxHistoryLength: 50,
    dependencies: [
        'leaflet',
        'jspdf',
        'leaflet-geocoder'
    ]
};

class EmergencyFormApp {
    constructor() {
        this.initialized = false;
        this.services = {
            state: null,
            ui: null,
            map: null
        };
    }

    async init() {
        try {
            console.log(`Iniciando aplicación versión ${AppConfig.version}`);
            
            await this.checkDependencies();
            await this.initializeServices();
            this.setupGlobalListeners();
            this.restoreState();

            this.initialized = true;
            console.log('Aplicación iniciada correctamente');
            return true;
        } catch (error) {
            console.error('Error al iniciar la aplicación:', error);
            this.handleInitError(error);
            return false;
        }
    }

    async checkDependencies() {
        const missing = AppConfig.dependencies.filter(dep => {
            switch (dep) {
                case 'leaflet': return !window.L;
                case 'jspdf': return !window.jspdf;
                case 'leaflet-geocoder': return !window.L || !window.L.Control.Geocoder;
                default: return false;
            }
        });

        if (missing.length > 0) {
            throw new Error(`Dependencias faltantes: ${missing.join(', ')}`);
        }
    }

    async initializeServices() {
        try {
            this.services.state = window.StateManager;
            this.services.ui = window.UIManager;
            this.services.map = window.MapService;

            if (!this.services.state || !this.services.ui || !this.services.map) {
                throw new Error('Error al inicializar servicios');
            }

            document.getElementById('mostrarMapa')?.addEventListener('click', async () => {
                const mapContainer = document.getElementById('mapaContainer');
                if (mapContainer.style.display !== 'none' && !this.services.map.map) {
                    await this.services.map.init();
                }
            });

            this.setupAutoSave();

        } catch (error) {
            console.error('Error al inicializar servicios:', error);
            throw error;
        }
    }

    setupGlobalListeners() {
        window.addEventListener('error', (event) => {
            console.error('Error no capturado:', event.error);
            this.services.ui?.showError('Ha ocurrido un error inesperado');
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Promesa rechazada no manejada:', event.reason);
            this.services.ui?.showError('Ha ocurrido un error inesperado');
        });

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden' && this.services.state) {
                this.services.state.saveToLocalStorage();
            }
        });
    }

    setupAutoSave() {
        setInterval(() => {
            if (this.services.state && this.services.state.getState().formState.isDirty) {
                this.services.state.saveToLocalStorage();
                if (AppConfig.debug) {
                    console.log('Estado guardado automáticamente');
                }
            }
        }, AppConfig.autoSaveInterval);
    }

    restoreState() {
        if (this.services.state) {
            const restored = this.services.state.loadFromLocalStorage();
            if (restored && AppConfig.debug) {
                console.log('Estado restaurado');
            }
        }
    }

    handleInitError(error) {
        const message = 'Error al iniciar la aplicación: ' + error.message;
        console.error(message);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'init-error';
        errorDiv.innerHTML = `
            <h3>Error de Inicialización</h3>
            <p>${message}</p>
            <button onclick="window.location.reload()">Reintentar</button>
        `;
        
        document.body.innerHTML = '';
        document.body.appendChild(errorDiv);
    }

    async restart() {
        try {
            if (this.services.state) {
                this.services.state.resetForm(false);
            }
            if (this.services.map && this.services.map.map) {
                this.services.map.destroy();
            }
            if (this.services.ui) {
                location.reload();
            }
        } catch (error) {
            console.error('Error al reiniciar:', error);
            this.services.ui?.showError('Error al reiniciar la aplicación');
        }
    }

    toggleDebug() {
        AppConfig.debug = !AppConfig.debug;
        console.log(`Modo debug: ${AppConfig.debug ? 'activado' : 'desactivado'}`);
        return AppConfig.debug;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    window.app = new EmergencyFormApp();
    const initialized = await window.app.init();
    
    if (!initialized && AppConfig.debug) {
        console.error('La aplicación no se pudo inicializar correctamente');
    }
});