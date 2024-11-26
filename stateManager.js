const StateManager = {
    data: {
        emergencia: {
            obac: {
                nombre: '',
                cargo: '',
                compania: ''
            },
            mandoCompania: {
                nombre: '',
                cargo: '',
                compania: '6'
            },
            fecha: '',
            horaSalida: '',
            horaLlegada: '',
            direccion: '',
            coordenadas: null,
            tipoEmergencia: '',
            magnitud: '',
            puntoOrigen: '',
            observaciones: ''
        },
        pacientes: [],
        vehiculos: [],
        unidadesBomberos: [],
        unidadesCarabineros: [],
        unidadesAmbulancia: [],
        voluntarios: []
    },
    
    formState: {
        currentStep: 'emergencia',
        isDirty: false,
        lastUpdate: null,
    },

    history: [],
    historyIndex: -1,
    maxHistoryLength: 50,

    init() {
        this.loadFromLocalStorage();
        this.setupAutosave();
        return this;
    },

    getState() {
        return {
            data: this.data,
            formState: this.formState,
            canUndo: this.historyIndex > 0,
            canRedo: this.historyIndex < this.history.length - 1
        };
    },

    getData(key) {
        return key ? this.data[key] : this.data;
    },

    updateData(key, value, shouldSave = true) {
        this.pushToHistory();

        if (typeof key === 'string') {
            this.data[key] = value;
        } else if (typeof key === 'object') {
            Object.assign(this.data, key);
        }

        this.formState.isDirty = true;
        this.formState.lastUpdate = new Date();

        if (shouldSave) {
            this.saveToLocalStorage();
        }

        this.notifyChange(key);
    },

    validate() {
        return window.validarFormularioCompleto();
    },

    pushToHistory() {
        const currentState = JSON.stringify(this.data);
        
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }

        this.history.push(currentState);
        this.historyIndex++;

        if (this.history.length > this.maxHistoryLength) {
            this.history.shift();
            this.historyIndex--;
        }
    },

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.data = JSON.parse(this.history[this.historyIndex]);
            this.notifyChange('undo');
            return true;
        }
        return false;
    },

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.data = JSON.parse(this.history[this.historyIndex]);
            this.notifyChange('redo');
            return true;
        }
        return false;
    },

    saveToLocalStorage() {
        try {
            localStorage.setItem('emergenciaForm', JSON.stringify(this.data));
            localStorage.setItem('emergenciaFormState', JSON.stringify(this.formState));
            return true;
        } catch (error) {
            console.error('Error al guardar:', error);
            return false;
        }
    },

    loadFromLocalStorage() {
        try {
            const savedData = localStorage.getItem('emergenciaForm');
            const savedState = localStorage.getItem('emergenciaFormState');
            
            if (savedData) {
                this.data = JSON.parse(savedData);
            }
            
            if (savedState) {
                this.formState = JSON.parse(savedState);
            }

            return true;
        } catch (error) {
            console.error('Error al cargar:', error);
            return false;
        }
    },

    setupAutosave(interval = 30000) {
        setInterval(() => {
            if (this.formState.isDirty) {
                this.saveToLocalStorage();
                this.formState.isDirty = false;
            }
        }, interval);
    },

    listeners: {},

    subscribe(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    },

    unsubscribe(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    },

    notifyChange(key) {
        if (this.listeners[key]) {
            this.listeners[key].forEach(callback => callback(this.data[key]));
        }
        
        if (this.listeners['*']) {
            this.listeners['*'].forEach(callback => callback(this.data));
        }
    },

    setStep(step) {
        this.formState.currentStep = step;
        this.notifyChange('step');
    },

    resetForm(confirmacion = true) {
        if (!confirmacion || confirm('¿Está seguro de reiniciar el formulario? Se perderán todos los datos.')) {
            this.data = {
                emergencia: {
                    obac: { nombre: '', cargo: '', compania: '' },
                    mandoCompania: { nombre: '', cargo: '', compania: '6' },
                    fecha: '',
                    horaSalida: '',
                    horaLlegada: '',
                    direccion: '',
                    coordenadas: null,
                    tipoEmergencia: '',
                    magnitud: '',
                    puntoOrigen: '',
                    observaciones: ''
                },
                pacientes: [],
                vehiculos: [],
                unidadesBomberos: [],
                unidadesCarabineros: [],
                unidadesAmbulancia: [],
                voluntarios: []
            };
            this.formState.isDirty = true;
            this.formState.currentStep = 'emergencia';
            this.history = [];
            this.historyIndex = -1;
            
            this.saveToLocalStorage();
            this.notifyChange('reset');
            return true;
        }
        return false;
    }
};

window.StateManager = StateManager.init();