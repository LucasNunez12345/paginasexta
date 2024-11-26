// Utilidades y funciones auxiliares
const Utils = {
    // Formateo de fecha y hora
    datetime: {
        formatDate(date) {
            if (!date) return '';
            if (typeof date === 'string') {
                date = new Date(date);
            }
            return date.toLocaleDateString('es-CL', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        },

        formatTime(time) {
            if (!time) return '';
            const [hours, minutes] = time.split(':');
            return new Date(0, 0, 0, hours, minutes)
                .toLocaleTimeString('es-CL', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                });
        },

        formatDateTime(date, time) {
            if (!date || !time) return '';
            const datetime = new Date(`${date}T${time}`);
            return datetime.toLocaleString('es-CL', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        },

        getTimeDifference(startTime, endTime) {
            const start = new Date(`1970-01-01T${startTime}`);
            let end = new Date(`1970-01-01T${endTime}`);
            
            if (end < start) {
                end = new Date(`1970-01-02T${endTime}`);
            }
            
            return (end - start) / 1000 / 60; // Diferencia en minutos
        },

        getCurrentDateTime() {
            const now = new Date();
            return {
                date: now.toISOString().split('T')[0],
                time: now.toTimeString().slice(0, 5)
            };
        }
    },

    // Validaciones generales
    validation: {
        rut: {
            clean(rut) {
                return rut.toString().replace(/[^0-9kK]/g, '').toUpperCase();
            },

            format(rut) {
                rut = this.clean(rut);
                let result = rut.slice(-1);
                let digits = rut.slice(0, -1);
                while (digits.length > 3) {
                    result = '.' + digits.slice(-3) + result;
                    digits = digits.slice(0, -3);
                }
                if (digits) {
                    result = digits + result;
                }
                return result;
            },

            validate(rut) {
                if (typeof rut !== 'string') return false;
                
                rut = this.clean(rut);
                if (!/^[0-9]{7,8}[0-9Kk]$/.test(rut)) return false;
                
                const dv = rut.slice(-1).toUpperCase();
                const numero = parseInt(rut.slice(0, -1));
                return dv === this.calculateDV(numero);
            },

            calculateDV(numero) {
                let suma = 0;
                let multiplicador = 2;
                
                while (numero > 0) {
                    suma += (numero % 10) * multiplicador;
                    numero = Math.floor(numero / 10);
                    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
                }
                
                const resultado = 11 - (suma % 11);
                if (resultado === 11) return '0';
                if (resultado === 10) return 'K';
                return resultado.toString();
            }
        },

        patente: {
            formatoAntiguo: /^[A-Z]{2}\d{4}$/,
            formatoNuevo: /^[A-Z]{4}\d{2}$/,
            formatoMotoAntiguo: /^[A-Z]{2}\d{3}$/,
            formatoMotoNuevo: /^[A-Z]{2}\d{2}[A-Z]{2}$/,

            validate(patente, tipo) {
                if (typeof patente !== 'string') return false;
                patente = patente.toUpperCase();

                switch(tipo) {
                    case 'auto':
                        return this.formatoAntiguo.test(patente) || 
                               this.formatoNuevo.test(patente);
                    case 'moto':
                        return this.formatoMotoAntiguo.test(patente) || 
                               this.formatoMotoNuevo.test(patente);
                    default:
                        return false;
                }
            }
        }
    },

    // Funciones de strings
    strings: {
        capitalize(string) {
            if (typeof string !== 'string') return '';
            return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
        },

        normalizeString(string) {
            if (typeof string !== 'string') return '';
            return string.normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .toLowerCase();
        },

        removeExtraSpaces(string) {
            if (typeof string !== 'string') return '';
            return string.replace(/\s+/g, ' ').trim();
        }
    },

    // Funciones de objetos y arrays
    objects: {
        deepClone(obj) {
            return JSON.parse(JSON.stringify(obj));
        },

        isEqual(obj1, obj2) {
            return JSON.stringify(obj1) === JSON.stringify(obj2);
        },

        mergeDeep(...objects) {
            return objects.reduce((prev, obj) => {
                Object.keys(obj).forEach(key => {
                    const pVal = prev[key];
                    const oVal = obj[key];

                    if (Array.isArray(pVal) && Array.isArray(oVal)) {
                        prev[key] = [...new Set([...pVal, ...oVal])];
                    }
                    else if (this.isObject(pVal) && this.isObject(oVal)) {
                        prev[key] = this.mergeDeep(pVal, oVal);
                    }
                    else {
                        prev[key] = oVal;
                    }
                });

                return prev;
            }, {});
        },

        isObject(item) {
            return (item && typeof item === 'object' && !Array.isArray(item));
        }
    },

    // Funciones para el manejo de formularios
    form: {
        serializeForm(form) {
            const formData = new FormData(form);
            const data = {};
            
            for (let [key, value] of formData.entries()) {
                if (data[key]) {
                    if (!Array.isArray(data[key])) {
                        data[key] = [data[key]];
                    }
                    data[key].push(value);
                } else {
                    data[key] = value;
                }
            }
            
            return data;
        },

        populateForm(form, data) {
            Object.keys(data).forEach(key => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) {
                    switch (input.type) {
                        case 'radio':
                            const radio = form.querySelector(`[name="${key}"][value="${data[key]}"]`);
                            if (radio) radio.checked = true;
                            break;
                        case 'checkbox':
                            input.checked = Boolean(data[key]);
                            break;
                        default:
                            input.value = data[key];
                    }
                }
            });
        }
    },

    // Control de rendimiento
    performance: {
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        throttle(func, limit) {
            let inThrottle;
            return function executedFunction(...args) {
                if (!inThrottle) {
                    func(...args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }
    },

    // Manejo de errores
    error: {
        logError(error, context = '') {
            console.error(`[${new Date().toISOString()}] ${context}:`, error);
            // Aquí podrías agregar integración con un servicio de logging
        },

        handleError(error, showUI = true) {
            this.logError(error);
            if (showUI && window.UIManager) {
                window.UIManager.showError(error.message || 'Error inesperado');
            }
            return {
                success: false,
                error: error.message || 'Error inesperado'
            };
        }
    }
};

// Exportar utilidades
window.Utils = Utils;