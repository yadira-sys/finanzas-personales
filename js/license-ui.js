/**
 * LicenseUI - Interfaz de Usuario para Sistema de Licencias
 * Gestiona la pantalla de activación y validación visual
 */

class LicenseUI {
    constructor(licenseManager) {
        this.licenseManager = licenseManager;
        this.onActivated = null; // Callback cuando se activa correctamente
    }

    /**
     * Renderiza la pantalla de activación de licencia
     */
    renderActivationScreen() {
        const container = document.getElementById('licenseScreen');
        if (!container) {
            console.error('No se encontró el contenedor #licenseScreen');
            return;
        }

        container.innerHTML = `
            <div class="license-container">
                <div class="license-header">
                    <div class="license-logo">
                        <i class="fas fa-shield-check"></i>
                    </div>
                    <h1>Activa Tu Dinero Claro</h1>
                    <p class="license-subtitle">Introduce tu clave de licencia para continuar</p>
                </div>

                <div class="license-card">
                    <form id="activationForm" class="activation-form">
                        <div class="form-group">
                            <label for="licenseKey">
                                <i class="fas fa-key"></i> Clave de Licencia
                            </label>
                            <input 
                                type="text" 
                                id="licenseKey" 
                                name="licenseKey"
                                placeholder="TDC-2025-XXXXX"
                                maxlength="15"
                                autocomplete="off"
                                required
                            >
                            <small class="form-hint">Formato: TDC-2025-XXXXX</small>
                        </div>

                        <div class="form-group">
                            <label for="licenseEmail">
                                <i class="fas fa-envelope"></i> Email (opcional)
                            </label>
                            <input 
                                type="email" 
                                id="licenseEmail" 
                                name="licenseEmail"
                                placeholder="tu@email.com"
                                autocomplete="email"
                            >
                            <small class="form-hint">Para recibir actualizaciones y soporte</small>
                        </div>

                        <button type="submit" class="btn btn-primary btn-activate">
                            <i class="fas fa-unlock"></i> Activar Licencia
                        </button>

                        <div id="activationError" class="activation-error" style="display: none;">
                            <i class="fas fa-exclamation-circle"></i>
                            <span class="error-message"></span>
                        </div>
                    </form>

                    <div class="license-info">
                        <h3><i class="fas fa-info-circle"></i> ¿Dónde está mi clave?</h3>
                        <ul>
                            <li>Revisa el email de confirmación de compra</li>
                            <li>Tu clave tiene el formato: <strong>TDC-2025-XXXXX</strong></li>
                            <li>Si no la encuentras, contacta a soporte</li>
                        </ul>
                    </div>

                    <div class="license-footer">
                        <p>
                            <i class="fas fa-lock"></i> 
                            Tu licencia se guarda de forma segura en tu navegador
                        </p>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
        this.autoFormatLicenseKey();
        this.checkPendingLicense(); // ⭐ Nueva función
    }

    /**
     * Verifica si hay una licencia pendiente desde bienvenida.html
     */
    checkPendingLicense() {
        const pendingLicense = sessionStorage.getItem('pendingLicense');
        
        if (pendingLicense) {
            console.log('🔑 Licencia detectada desde bienvenida.html:', pendingLicense);
            
            // Pre-rellenar el campo
            const licenseInput = document.getElementById('licenseKey');
            if (licenseInput) {
                licenseInput.value = pendingLicense;
                licenseInput.focus();
                
                // Agregar efecto visual
                licenseInput.classList.add('pre-filled');
                setTimeout(() => {
                    licenseInput.classList.remove('pre-filled');
                }, 1000);
            }
            
            // Limpiar sessionStorage después de usarla
            sessionStorage.removeItem('pendingLicense');
        }
    }

    /**
     * Adjunta event listeners al formulario
     */
    attachEventListeners() {
        const form = document.getElementById('activationForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleActivation();
        });
    }

    /**
     * Auto-formatea la clave de licencia mientras se escribe
     */
    autoFormatLicenseKey() {
        const input = document.getElementById('licenseKey');
        if (!input) return;

        input.addEventListener('input', (e) => {
            let value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
            
            // Auto-insertar guiones
            if (value.length >= 3 && value.charAt(3) !== '-') {
                value = value.substring(0, 3) + '-' + value.substring(3);
            }
            if (value.length >= 8 && value.charAt(8) !== '-') {
                value = value.substring(0, 8) + '-' + value.substring(8);
            }
            
            e.target.value = value;
        });
    }

    /**
     * Maneja el proceso de activación
     */
    async handleActivation() {
        const keyInput = document.getElementById('licenseKey');
        const emailInput = document.getElementById('licenseEmail');
        const errorDiv = document.getElementById('activationError');
        const submitBtn = document.querySelector('.btn-activate');

        const key = keyInput.value.trim();
        const email = emailInput.value.trim();

        // Limpiar error previo
        this.hideError();

        // Deshabilitar botón durante validación
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Validando...';

        // Simular delay para efecto de validación
        await this.sleep(800);

        // Validar licencia
        const result = this.licenseManager.activateLicense(key, email);

        if (result.valid) {
            // Éxito - Mostrar animación y continuar
            this.showSuccessAnimation();
            
            // Esperar animación
            await this.sleep(2000);
            
            // Callback para continuar a la app
            if (this.onActivated) {
                this.onActivated();
            }
        } else {
            // Error - Mostrar mensaje
            this.showError(result.error);
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-unlock"></i> Activar Licencia';
        }
    }

    /**
     * Muestra un error de validación
     */
    showError(message) {
        const errorDiv = document.getElementById('activationError');
        if (!errorDiv) return;

        errorDiv.querySelector('.error-message').textContent = message;
        errorDiv.style.display = 'flex';
        
        // Animar entrada
        errorDiv.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            errorDiv.style.animation = '';
        }, 500);
    }

    /**
     * Oculta el mensaje de error
     */
    hideError() {
        const errorDiv = document.getElementById('activationError');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }

    /**
     * Muestra animación de éxito
     */
    showSuccessAnimation() {
        const form = document.querySelector('.activation-form');
        if (!form) return;

        form.innerHTML = `
            <div class="success-animation">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2>¡Licencia Activada!</h2>
                <p>Bienvenido a Tu Dinero Claro</p>
                <div class="success-loader">
                    <div class="loader-bar"></div>
                </div>
            </div>
        `;
    }

    /**
     * Renderiza información de licencia activa (para configuración)
     */
    renderLicenseInfo(container) {
        const info = this.licenseManager.getLicenseInfo();
        
        if (!info) {
            container.innerHTML = '<p>No hay licencia activada</p>';
            return;
        }

        container.innerHTML = `
            <div class="license-info-card">
                <div class="info-row">
                    <span class="info-label"><i class="fas fa-key"></i> Clave:</span>
                    <span class="info-value">${this.maskLicenseKey(info.key)}</span>
                </div>
                ${info.email ? `
                    <div class="info-row">
                        <span class="info-label"><i class="fas fa-envelope"></i> Email:</span>
                        <span class="info-value">${info.email}</span>
                    </div>
                ` : ''}
                <div class="info-row">
                    <span class="info-label"><i class="fas fa-calendar"></i> Activada:</span>
                    <span class="info-value">${info.activatedAt}</span>
                </div>
                <div class="info-row">
                    <span class="info-label"><i class="fas fa-desktop"></i> Dispositivo:</span>
                    <span class="info-value">${info.deviceId}</span>
                </div>
            </div>
        `;
    }

    /**
     * Enmascara parcialmente la clave de licencia para mostrar
     */
    maskLicenseKey(key) {
        if (!key || key.length < 10) return key;
        const parts = key.split('-');
        if (parts.length === 3) {
            return `${parts[0]}-${parts[1]}-***${parts[2].slice(-2)}`;
        }
        return key;
    }

    /**
     * Utilidad: sleep
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Exportar para uso global
window.LicenseUI = LicenseUI;
