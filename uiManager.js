const UIManager = {
    elements: {
        forms: {
            emergency: document.getElementById('emergencyForm'),
            attendance: document.getElementById('asistenciaForm')
        },
        buttons: {
            continue: document.getElementById('btnContinuar'),
            back: document.getElementById('btnVolver'),
            generatePDF: document.getElementById('btnGenerarPDF'),
            showMap: document.getElementById('mostrarMapa'),
            reset: document.getElementById('btnReset'),
            undo: document.getElementById('btnUndo'),
            redo: document.getElementById('btnRedo')
        },
        containers: {
            map: document.getElementById('mapaContainer'),
            pdfPreview: document.getElementById('pdfPreviewContainer'),
            errorMessages: document.getElementById('errorMessages'),
            loading: document.getElementById('loadingIndicator')
        }
    },

    state: {
        isLoading: false,
        currentStep: 'emergency',
        errorTimeout: null,
        messageTimeout: null
    },

    init() {
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        return this;
    },

    setupEventListeners() {
        Object.entries(this.elements.buttons).forEach(([key, button]) => {
            if (button) {
                button.addEventListener('click', (e) => this.handleButtonClick(e, key));
            }
        });

        window.addEventListener('beforeunload', (e) => {
            if (window.StateManager.getState().formState.isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    },

    handleButtonClick(event, buttonType) {
        event.preventDefault();
        switch (buttonType) {
            case 'continue':
                this.handleContinue();
                break;
            case 'back':
                this.handleBack();
                break;
            case 'generatePDF':
                this.handleGeneratePDF();
                break;
            case 'showMap':
                this.toggleMap();
                break;
            case 'reset':
                this.handleReset();
                break;
            case 'undo':
                this.handleUndo();
                break;
            case 'redo':
                this.handleRedo();
                break;
        }
    },

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                window.StateManager.saveToLocalStorage();
                this.showMessage('Cambios guardados', 'success');
            }
        });
    },

    showLoading(message = 'Cargando...') {
        const loadingEl = this.elements.containers.loading;
        const messageEl = loadingEl.querySelector('.loading-message');
        messageEl.textContent = message;
        loadingEl.style.display = 'flex';
        requestAnimationFrame(() => loadingEl.style.opacity = '1');
        this.state.isLoading = true;
    },

    hideLoading() {
        const loadingEl = this.elements.containers.loading;
        loadingEl.style.opacity = '0';
        setTimeout(() => {
            loadingEl.style.display = 'none';
            this.state.isLoading = false;
        }, 300);
    },

    showError(message) {
        const errorContainer = this.elements.containers.errorMessages;
        if (this.state.errorTimeout) {
            clearTimeout(this.state.errorTimeout);
        }

        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
        errorContainer.style.opacity = '1';

        this.state.errorTimeout = setTimeout(() => {
            errorContainer.style.opacity = '0';
            setTimeout(() => {
                errorContainer.style.display = 'none';
            }, 300);
        }, 5000);
    },
    showErrors(errors) {
        if (!Array.isArray(errors)) {
            errors = [errors];
        }

        const errorContainer = this.elements.containers.errorMessages;
        errorContainer.innerHTML = '';
        
        const ul = document.createElement('ul');
        errors.forEach(error => {
            const li = document.createElement('li');
            li.textContent = error;
            ul.appendChild(li);
        });

        errorContainer.appendChild(ul);
        errorContainer.style.display = 'block';
        errorContainer.style.opacity = '1';

        if (this.state.errorTimeout) {
            clearTimeout(this.state.errorTimeout);
        }

        this.state.errorTimeout = setTimeout(() => {
            errorContainer.style.opacity = '0';
            setTimeout(() => {
                errorContainer.style.display = 'none';
                errorContainer.innerHTML = '';
            }, 300);
        }, 5000);
    },

    showMessage(message, type = 'info') {
        let messageEl = document.querySelector('.message-indicator');
        
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.className = 'message-indicator';
            document.body.appendChild(messageEl);
        }

        messageEl.className = `message-indicator message-${type}`;
        messageEl.textContent = message;
        messageEl.style.display = 'block';
        
        requestAnimationFrame(() => {
            messageEl.style.opacity = '1';
        });

        if (this.state.messageTimeout) {
            clearTimeout(this.state.messageTimeout);
        }

        this.state.messageTimeout = setTimeout(() => {
            messageEl.style.opacity = '0';
            setTimeout(() => messageEl.remove(), 300);
        }, 3000);
    },

    handleContinue() {
        const validation = window.StateManager.validate();
        if (!validation.esValido) {
            this.showErrors(validation.errores);
            return;
        }
        this.animateFormTransition('emergency', 'attendance');
    },

    handleBack() {
        this.animateFormTransition('attendance', 'emergency');
    },

    animateFormTransition(fromForm, toForm) {
        const currentForm = this.elements.forms[fromForm];
        const nextForm = this.elements.forms[toForm];

        if (!currentForm || !nextForm) return;

        currentForm.style.opacity = '0';
        currentForm.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            currentForm.style.display = 'none';
            nextForm.style.display = 'block';
            
            requestAnimationFrame(() => {
                nextForm.style.opacity = '1';
                nextForm.style.transform = 'translateX(0)';
            });
        }, 300);
    },

    toggleMap() {
        const mapContainer = this.elements.containers.map;
        if (!mapContainer) return;

        const isVisible = mapContainer.style.display !== 'none';
        
        if (!isVisible) {
            mapContainer.style.display = 'block';
            requestAnimationFrame(() => {
                mapContainer.style.opacity = '1';
                mapContainer.style.transform = 'scale(1)';
            });
        } else {
            mapContainer.style.opacity = '0';
            mapContainer.style.transform = 'scale(0.95)';
            setTimeout(() => mapContainer.style.display = 'none', 300);
        }
    },

    async handleGeneratePDF() {
        try {
            this.showLoading('Generando PDF...');
            await window.generarPDF();
            this.showMessage('PDF generado exitosamente', 'success');
        } catch (error) {
            console.error('Error al generar PDF:', error);
            this.showError('Error al generar el PDF');
        } finally {
            this.hideLoading();
        }
    },

    handleReset() {
        if (window.StateManager.resetForm()) {
            this.showMessage('Formulario reiniciado', 'info');
        }
    },

    handleUndo() {
        if (window.StateManager.undo()) {
            this.showMessage('Cambio deshecho', 'info');
        }
    },

    handleRedo() {
        if (window.StateManager.redo()) {
            this.showMessage('Cambio rehecho', 'info');
        }
    },
};

// Exportar UIManager
window.UIManager = UIManager.init();