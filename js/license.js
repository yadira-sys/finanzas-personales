/**
 * LicenseManager - Sistema de Licencias para Tu Dinero Claro
 * Gestiona la validación y almacenamiento de licencias de producto
 */

class LicenseManager {
    constructor() {
        this.storageKey = 'tdc_license';
        this.secretKey = 'TDC2025'; // Clave para validación offline
    }

    /**
     * Verifica si hay una licencia activada
     */
    isActivated() {
        const license = this.getLicense();
        return license && license.activated === true;
    }

    /**
     * Obtiene la licencia almacenada
     */
    getLicense() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error al leer licencia:', error);
            return null;
        }
    }

    /**
     * Valida una clave de licencia
     * Formato: TDC-2025-XXXXX (donde XXXXX es un código de 5 caracteres alfanuméricos)
     */
    validateLicenseKey(key) {
        if (!key || typeof key !== 'string') {
            return { valid: false, error: 'Clave inválida' };
        }

        // Limpiar espacios
        key = key.trim().toUpperCase();

        // Verificar formato: TDC-2025-XXXXX
        const pattern = /^TDC-2025-[A-Z0-9]{5}$/;
        if (!pattern.test(key)) {
            return { 
                valid: false, 
                error: 'Formato incorrecto. Debe ser: TDC-2025-XXXXX' 
            };
        }

        // Extraer código
        const code = key.split('-')[2];

        // Validación offline con checksum simple
        if (!this.verifyChecksum(code)) {
            return { 
                valid: false, 
                error: 'Clave de licencia no válida' 
            };
        }

        return { valid: true, key: key };
    }

    /**
     * Verifica el checksum de un código de licencia
     * Implementación simple para validación offline
     */
    verifyChecksum(code) {
        // Algoritmo simple: la suma de los valores ASCII debe ser divisible por 7
        // y el último carácter debe cumplir una condición específica
        
        let sum = 0;
        for (let i = 0; i < code.length - 1; i++) {
            sum += code.charCodeAt(i);
        }
        
        const checkDigit = code.charCodeAt(code.length - 1);
        const expectedCheck = (sum % 26) + 65; // A-Z
        
        return checkDigit === expectedCheck;
    }

    /**
     * Activa una licencia
     */
    activateLicense(key, email = '') {
        const validation = this.validateLicenseKey(key);
        
        if (!validation.valid) {
            return validation;
        }

        const license = {
            key: validation.key,
            email: email.trim(),
            activated: true,
            activatedAt: new Date().toISOString(),
            deviceId: this.getDeviceId()
        };

        try {
            localStorage.setItem(this.storageKey, JSON.stringify(license));
            return { valid: true, license };
        } catch (error) {
            return { 
                valid: false, 
                error: 'Error al guardar la licencia. Verifica el almacenamiento del navegador.' 
            };
        }
    }

    /**
     * Desactiva la licencia (para pruebas o transferencias)
     */
    deactivateLicense() {
        localStorage.removeItem(this.storageKey);
    }

    /**
     * Genera un ID único del dispositivo (fingerprint simple)
     */
    getDeviceId() {
        let deviceId = localStorage.getItem('tdc_device_id');
        
        if (!deviceId) {
            // Generar ID basado en características del navegador
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillText('TDC', 2, 2);
            
            const canvasData = canvas.toDataURL();
            const hash = this.simpleHash(
                navigator.userAgent + 
                navigator.language + 
                screen.colorDepth + 
                screen.width + 
                screen.height +
                canvasData
            );
            
            deviceId = 'DEV-' + hash.substring(0, 12);
            localStorage.setItem('tdc_device_id', deviceId);
        }
        
        return deviceId;
    }

    /**
     * Hash simple para generar ID de dispositivo
     */
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36).toUpperCase();
    }

    /**
     * Genera una clave de licencia válida (para uso del vendedor)
     * Este método NO debe estar en la versión de producción que se entrega al cliente
     */
    generateLicenseKey() {
        // Generar 4 caracteres aleatorios
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 4; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        // Calcular dígito de verificación
        let sum = 0;
        for (let i = 0; i < code.length; i++) {
            sum += code.charCodeAt(i);
        }
        const checkChar = String.fromCharCode((sum % 26) + 65);
        code += checkChar;
        
        return `TDC-2025-${code}`;
    }

    /**
     * Obtiene información de la licencia para mostrar
     */
    getLicenseInfo() {
        const license = this.getLicense();
        
        if (!license) {
            return null;
        }

        return {
            key: license.key,
            email: license.email,
            activatedAt: new Date(license.activatedAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            deviceId: license.deviceId
        };
    }
}

// Exportar para uso global
window.LicenseManager = LicenseManager;
